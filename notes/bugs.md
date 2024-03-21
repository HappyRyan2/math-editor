# List of Bugs
- Superscripts and subscripts are still aligned incorrectly when their content is multiple lines tall (e.g. a fraction).
- If you're in the very beginning of a composite object and you press enter, it will put the line break at the end of the object, which could feel very strange. A possible solution would be to make it so it checks if your cursor is in the first half or the second half of the top-level ancestor and uses that to determine whether to put the line break before or after the top-level ancestor.
- Selection behaves strangely when clicking and dragging to select a line that is being word-wrapped.
