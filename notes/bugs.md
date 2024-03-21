# List of Bugs
- Superscripts and subscripts are still aligned incorrectly when their content is multiple lines tall (e.g. a fraction).
- If you're in the very beginning of a composite object and you press enter, it will put the line break at the end of the object, which could feel very strange. A possible solution would be to make it so it checks if your cursor is in the first half or the second half of the top-level ancestor and uses that to determine whether to put the line break before or after the top-level ancestor.
- Typing a math operator (e.g. "-" or "+") after several empty lines causes it to appear above the empty lines.
- If you select a 1-word line that is broken over multiple lines by dragging your cursor from right to left, the line moves down slightly.