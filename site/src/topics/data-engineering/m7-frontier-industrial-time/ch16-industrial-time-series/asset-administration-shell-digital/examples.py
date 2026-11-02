"""A type shell and two instance shells of one machine model, read through
the Asset Administration Shell's own assetKind attribute; a Digital
Nameplate submodel read from a mock REST endpoint and from a mock AASX
package, byte-identical; a semantic ID shown to make one property mean the
same thing regardless of which supplier wrote it; and a validation gate
that distinguishes a well-formed supplier submodel from a malformed one
before it reaches the lakehouse."""

from __future__ import annotations

from dataclasses import dataclass, field


# --- 1. Type vs instance shells, distinguished by assetKind -----------------


@dataclass
class Property:
    id_short: str
    value: str
    semantic_id: str  # a reference to a dictionary entry (ECLASS/IEC CDD), not free text


@dataclass
class Submodel:
    id_short: str
    properties: list[Property] = field(default_factory=list)

    def get(self, id_short: str) -> Property:
        for p in self.properties:
            if p.id_short == id_short:
                return p
        raise KeyError(id_short)


@dataclass
class AssetAdministrationShell:
    """AssetInformation/assetKind distinguishes a type shell (describing a
    machine model once) from an instance shell (one serial number); an
    instance may reference the type shell it derives from."""

    id_short: str
    asset_kind: str  # "Type" or "Instance"
    global_asset_id: str
    derived_from: str | None  # id_short of the type shell, for an instance
    submodels: list[Submodel] = field(default_factory=list)

    def submodel(self, id_short: str) -> Submodel:
        for s in self.submodels:
            if s.id_short == id_short:
                return s
        raise KeyError(id_short)


def build_type_and_instances() -> tuple[AssetAdministrationShell, AssetAdministrationShell, AssetAdministrationShell]:
    """One machine model (a type shell) and two instances of it (two serial
    numbers), each instance referencing the type it derives from."""
    type_shell = AssetAdministrationShell(
        id_short="PressModelX200",
        asset_kind="Type",
        global_asset_id="urn:example:type:press-x200",
        derived_from=None,
        submodels=[
            Submodel(
                "TechnicalData",
                [Property("MaxForce_kN", "2000", "0173-1#02-AAO927#003")],
            )
        ],
    )
    instance_a = AssetAdministrationShell(
        id_short="PressX200-SN-0001",
        asset_kind="Instance",
        global_asset_id="urn:example:instance:press-x200:0001",
        derived_from=type_shell.id_short,
        submodels=[
            Submodel(
                "Nameplate",
                [Property("SerialNumber", "0001", "0173-1#02-AAM556#002")],
            )
        ],
    )
    instance_b = AssetAdministrationShell(
        id_short="PressX200-SN-0002",
        asset_kind="Instance",
        global_asset_id="urn:example:instance:press-x200:0002",
        derived_from=type_shell.id_short,
        submodels=[
            Submodel(
                "Nameplate",
                [Property("SerialNumber", "0002", "0173-1#02-AAM556#002")],
            )
        ],
    )
    return type_shell, instance_a, instance_b


# --- 2. A Digital Nameplate read from a mock REST endpoint, and from a mock
#        AASX package: byte-identical content, two transports ---------------


def mock_rest_get_submodel(shell: AssetAdministrationShell, submodel_id_short: str) -> dict:
    """Stands in for Part 2's HTTP/REST API: GET a submodel by id_short."""
    sm = shell.submodel(submodel_id_short)
    return {"idShort": sm.id_short, "properties": {p.id_short: p.value for p in sm.properties}}


def mock_aasx_extract_submodel(aasx_bytes: bytes, submodel_id_short: str) -> dict:
    """Stands in for Part 5's AASX package: the same submodel, packaged as a
    file for exchange instead of served live. A real AASX is an OPC/ZIP
    container; here the "package" is a serialized bytes blob decoded the
    same way a real reader would unpack one file inside it."""
    import json

    package = json.loads(aasx_bytes.decode("utf-8"))
    sm = package["submodels"][submodel_id_short]
    return sm


def build_aasx_package(shell: AssetAdministrationShell) -> bytes:
    import json

    return json.dumps(
        {"submodels": {sm.id_short: mock_rest_get_submodel(shell, sm.id_short) for sm in shell.submodels}}
    ).encode("utf-8")


# --- 3. A semantic ID makes one property mean the same thing across two
#        suppliers who named the property differently -----------------------


def resolve_by_semantic_id(submodels: list[Submodel], semantic_id: str) -> list[Property]:
    """Two suppliers can give the same property two different id_shorts
    ("Weight" vs. "Mass_kg"); matching by semanticId instead of by name
    finds both, because the semantic ID — not the local name — carries the
    meaning."""
    found = []
    for sm in submodels:
        for p in sm.properties:
            if p.semantic_id == semantic_id:
                found.append(p)
    return found


def build_two_suppliers_same_semantic_id() -> list[Submodel]:
    """Supplier A calls the property "Weight"; supplier B calls it
    "Mass_kg". Both use the same ECLASS semantic ID for mass."""
    mass_semantic_id = "0173-1#02-AAA017#002"
    supplier_a = Submodel("TechnicalData", [Property("Weight", "42.5", mass_semantic_id)])
    supplier_b = Submodel("TechnicalData", [Property("Mass_kg", "42.5", mass_semantic_id)])
    return [supplier_a, supplier_b]


# --- 4. A validation gate: a well-formed submodel passes, a malformed one
#        (a property with no semantic ID) is caught before the lakehouse ---


class ValidationError(Exception):
    pass


def validate_submodel_against_template(sm: Submodel, required_semantic_ids: set[str]) -> None:
    """A submodel template names which properties, by semantic ID, a
    conformant submodel must carry. A submodel missing one, or carrying a
    property with no semantic ID at all, fails validation rather than
    landing in the lakehouse silently incomplete."""
    present = set()
    for p in sm.properties:
        if not p.semantic_id:
            raise ValidationError(f"property {p.id_short!r} has no semantic ID: cannot be matched to the template")
        present.add(p.semantic_id)
    missing = required_semantic_ids - present
    if missing:
        raise ValidationError(f"submodel {sm.id_short!r} is missing required semantic ID(s): {sorted(missing)}")


def build_malformed_submodel() -> Submodel:
    """A supplier's submodel with a property carrying no semantic ID at
    all — exactly the case a shared shape alone does not guarantee away."""
    return Submodel("TechnicalData", [Property("SomeValue", "99", "")])


if __name__ == "__main__":
    # 1. type vs instance, distinguished by assetKind
    type_shell, instance_a, instance_b = build_type_and_instances()
    assert type_shell.asset_kind == "Type"
    assert instance_a.asset_kind == "Instance" and instance_b.asset_kind == "Instance"
    assert instance_a.derived_from == type_shell.id_short == instance_b.derived_from
    assert instance_a.global_asset_id != instance_b.global_asset_id  # two distinct serial numbers
    assert instance_a.submodel("Nameplate").get("SerialNumber").value == "0001"
    assert instance_b.submodel("Nameplate").get("SerialNumber").value == "0002"
    # the type shell's technical data is defined once, not duplicated per instance
    assert type_shell.submodel("TechnicalData").get("MaxForce_kN").value == "2000"

    # 2. REST endpoint and AASX package return the identical submodel content
    rest_result = mock_rest_get_submodel(instance_a, "Nameplate")
    aasx_bytes = build_aasx_package(instance_a)
    aasx_result = mock_aasx_extract_submodel(aasx_bytes, "Nameplate")
    assert rest_result == aasx_result
    assert rest_result["properties"]["SerialNumber"] == "0001"

    # 3. semantic ID resolves the same property across two suppliers' own naming
    two_suppliers = build_two_suppliers_same_semantic_id()
    mass_semantic_id = "0173-1#02-AAA017#002"
    matches = resolve_by_semantic_id(two_suppliers, mass_semantic_id)
    assert len(matches) == 2
    assert {p.id_short for p in matches} == {"Weight", "Mass_kg"}
    assert {p.value for p in matches} == {"42.5"}  # same value, two different local names

    # 4. validation gate: well-formed passes, malformed is caught
    required = {"0173-1#02-AAM556#002"}  # SerialNumber's semantic ID
    validate_submodel_against_template(instance_a.submodel("Nameplate"), required)  # does not raise

    malformed = build_malformed_submodel()
    try:
        validate_submodel_against_template(malformed, required)
        raise AssertionError("expected ValidationError for a property with no semantic ID")
    except ValidationError:
        pass

    incomplete = Submodel("Nameplate", [Property("SomeOther", "x", "0173-1#02-ZZZ999#001")])
    try:
        validate_submodel_against_template(incomplete, required)
        raise AssertionError("expected ValidationError for a submodel missing a required semantic ID")
    except ValidationError:
        pass

    # a shared, validated structure says nothing about whether the value itself is true —
    # a submodel can pass validation while still carrying a wrong number
    wrong_but_valid = Submodel("Nameplate", [Property("SerialNumber", "not-really-0001", "0173-1#02-AAM556#002")])
    validate_submodel_against_template(wrong_but_valid, required)  # passes: structure is fine, value is unchecked

    print("all AAS structure, transport, semantic-ID and validation assertions passed")
    print(f"type shell: {type_shell.id_short}, instances: {instance_a.id_short}, {instance_b.id_short}")
    print(f"REST and AASX both returned: {rest_result}")
    print(f"semantic ID {mass_semantic_id} resolved {len(matches)} differently-named properties to the same meaning")
    print("validation: well-formed submodel passed, missing-semantic-ID and incomplete submodels both rejected")
    print("validation does not check truth: a structurally valid submodel with a wrong value still passed")
