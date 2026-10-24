## pandas, "What's new in 3.0.0 (January 21, 2026)"

URL: https://pandas.pydata.org/docs/whatsnew/v3.0.0.html
Version: pandas 3.0.0 (January 21, 2026 release notes, served from the 3.1.0 docs build)

> Starting with pandas 3.0, a dedicated string data type is enabled by default
(backed by PyArrow under the hood, if installed, otherwise falling back to being
backed by NumPy object-dtype).

> The str dtype can only hold strings (or missing values), in contrast to
object dtype. (setitem with non string fails)

> The missing value sentinel is always NaN (np.nan) and follows the same
missing value semantics as the other default dtypes.

> The result of any indexing operation (subsetting a DataFrame or Series in any way,
i.e. including accessing a DataFrame column as a Series) or any method returning a
new DataFrame or Series, always behaves as if it were a copy in terms of user
API.

> As a consequence, if you want to modify an object (DataFrame or Series), the only way
to do this is to directly modify that object itself.

> Because every single indexing step now behaves as a copy, this also means that
“chained assignment” (updating a DataFrame with multiple setitem steps)
will stop working. Because this now consistently never works, the
SettingWithCopyWarning is removed, and defensive .copy() calls to
silence the warning are no longer needed.

> A secondary goal is to improve performance by avoiding unnecessary copies. As
mentioned above, every new DataFrame or Series returned from an indexing
operation or method behaves as a copy, but under the hood pandas will use
views as much as possible, and only copy when needed to guarantee the “behaves
as a copy” behaviour (this is the actual “copy-on-write” mechanism used as an
implementation detail).

> Setting the option mode.copy_on_write no longer has any impact. The option is deprecated
and will be removed in pandas 4.0.

> The new default resolution when parsing strings is microseconds, falling back
to nanoseconds when the precision of the string requires it.

Contents:
- Dedicated string data type by default (PyArrow-backed when installed, NumPy object fallback otherwise)
- Consistent copy/view behaviour with Copy-on-Write (indexing always behaves as a copy, chained assignment stops working, SettingWithCopyWarning removed)
- the `mode.copy_on_write` option deprecated and inert
- Datetime/timedelta resolution inference (microseconds the new default when parsing strings, nanoseconds only when precision requires it)

## pandas, "What's new in 2.3.0 (June 4, 2025)"

URL: https://pandas.pydata.org/docs/whatsnew/v2.3.0.html
Version: pandas 2.3.0 (June 4, 2025 release notes, served from the 3.1.0 docs build)

> However, the introduction of a new default dtype will also have some breaking
consequences to your code (for example when checking for the .dtype being
object dtype). To allow testing it in advance of the pandas 3.0 release, this
future dtype inference logic can be enabled in pandas 2.3 with:

> pd.options.future.infer_string = True

> The currently optional mode Copy-on-Write will be enabled by default in pandas 3.0. There
won’t be an option to retain the legacy behavior.

> The new behavior can be enabled since pandas 2.0 with the following option:

> pd.options.mode.copy_on_write = True

> Some of the behaviour changes allow a clear deprecation, like the changes in
chained assignment. Other changes are more subtle and thus, the warnings are
hidden behind an option that can be enabled since pandas 2.2:

> pd.options.mode.copy_on_write = "warn"

> This mode will warn in many different scenarios that aren’t actually relevant to
most queries. We recommend exploring this mode, but it is not necessary to get rid
of all of these warnings.

Contents:
- the opt-in `future.infer_string` flag for previewing the pandas 3.0 string dtype
- Copy-on-Write's pre-3.0 opt-in flags: `mode.copy_on_write = True` (hard behavior) and
  `mode.copy_on_write = "warn"` (soft, since 2.2, flags subtler cases)
- the explicit statement that 3.0 removes the option to keep the legacy (pre-CoW) behavior
