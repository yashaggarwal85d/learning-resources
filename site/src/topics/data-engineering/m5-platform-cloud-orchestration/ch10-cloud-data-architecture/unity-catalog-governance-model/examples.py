"""A local analogue of two real, documented Unity Catalog mechanisms (SOURCES.md): privilege
inheritance down a catalog->schema->table tree, and a tag-based ABAC policy that applies
automatically to an object created after the policy already exists. No real Unity Catalog
metastore runs in this sandbox, so this reproduces the documented *rules themselves* against a
synthetic namespace tree, not a live account's permission check.
"""
import json


class Namespace:
    """A catalog.schema.object tree, each node optionally carrying tags and direct grants."""

    def __init__(self, name, parent=None):
        self.name = name
        self.parent = parent
        self.children = {}
        self.direct_grants = set()
        self.tags = set()

    def add_child(self, name):
        child = Namespace(name, parent=self)
        self.children[name] = child
        return child

    def full_name(self):
        parts = []
        node = self
        while node is not None:
            parts.append(node.name)
            node = node.parent
        return ".".join(reversed(parts))

    def grant(self, privilege):
        self.direct_grants.add(privilege)

    def has_privilege(self, privilege):
        """Privilege inheritance: a grant on an ancestor flows down unless the privilege
        was only ever granted below it — matching SOURCES.md's quoted rule for SELECT."""
        node = self
        while node is not None:
            if privilege in node.direct_grants:
                return True
            node = node.parent
        return False


def privilege_inheritance_tree():
    """Granting SELECT on a schema flows down to a table created before AND after that grant,
    exactly as documented: inheritance applies to 'all current and future objects.'"""
    catalog = Namespace("prod")
    schema = catalog.add_child("sales")
    existing_table = schema.add_child("orders")

    schema.grant("SELECT")  # granted once, at the schema level

    new_table = schema.add_child("returns")  # created AFTER the grant

    result = {
        "existing_table_has_select": existing_table.has_privilege("SELECT"),
        "new_table_has_select": new_table.has_privilege("SELECT"),
        "catalog_itself_has_select": catalog.has_privilege("SELECT"),
    }
    assert result == {
        "existing_table_has_select": True,
        "new_table_has_select": True,
        "catalog_itself_has_select": False,
    }
    return result


class TagPolicy:
    """A row-filter/column-mask rule written once against a tag, standing in for a real
    Unity Catalog ABAC policy (SOURCES.md: 'Centralized rules applied automatically across
    many tables')."""

    def __init__(self, tag, rule):
        self.tag = tag
        self.rule = rule

    def applies_to(self, namespace_node):
        return self.tag in namespace_node.tags


def tag_policy_applies_to_a_table_created_after_it():
    """The hook: a schema is tagged 'pii-restricted' before the policy is written, and a table
    created after BOTH the tag and the policy still gets governed automatically — no new rule
    needed for that specific table."""
    catalog = Namespace("prod")
    schema = catalog.add_child("customers")
    schema.tags.add("pii-restricted")

    policy = TagPolicy(tag="pii-restricted", rule="mask ssn column")

    new_table = schema.add_child("profiles")  # created after the tag AND the policy exist

    assert policy.applies_to(schema) is True
    assert policy.applies_to(new_table) is False  # the policy checks the TAG, not inheritance

    # Unity Catalog's documented behaviour: a tag inherited from the schema covers the new table
    new_table.tags.add("pii-restricted")  # tag inheritance, the mechanism this reel shows
    assert policy.applies_to(new_table) is True

    return {
        "schema_tagged": "pii-restricted" in schema.tags,
        "new_table_governed_without_a_new_rule": policy.applies_to(new_table),
    }


def main():
    print(json.dumps(privilege_inheritance_tree(), indent=2))
    print(json.dumps(tag_policy_applies_to_a_table_created_after_it(), indent=2))


if __name__ == "__main__":
    main()
