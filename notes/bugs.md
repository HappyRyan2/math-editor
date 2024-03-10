# List of Bugs
- If you type something while something is selected, it should replace your selection with whatever you typed. Currently, however, it instead adds the typed text to the beginning or end of the selection, which is not correct.
- If you open something and then close the open-file dialog, it throws an error.
- If you create a new file and then save, it it still says "untitled" in the top instead of displaying the file name.
- Superscripts and subscripts are still aligned incorrectly when their content is multiple lines tall (e.g. a fraction).
- If you're in the very beginning of a composite object and you press enter, it will put the line break at the end of the object, which could feel very strange. A possible solution would be to make it so it checks if your cursor is in the first half or the second half of the top-level ancestor and uses that to determine whether to put the line break before or after the top-level ancestor.
- Selection behaves strangely when clicking and dragging to select a line that is being word-wrapped.
