# List of Bugs
- Superscripts and subscripts are still aligned incorrectly when their content is multiple lines tall (e.g. a fraction).
- If you're in the very beginning of a composite object and you press enter, it will put the line break at the end of the object, which could feel very strange. A possible solution would be to make it so it checks if your cursor is in the first half or the second half of the top-level ancestor and uses that to determine whether to put the line break before or after the top-level ancestor.
- If you select multiple lines and try to parenthesize them or put them in a fraction, weird things happen.
- In `LiveRenderer.deleteLineBreak`, there is a line that says `const nextComponent = App.document.getPreviousComponent(lineBreak)`. (Note that the method called is `getPreviousComponent`, which is not correct, and probably causes bugs in rare circumstances). Instead of getting the previous component, it should get the next component.
- If you press Backspace to delete the end of a parenthese, it doesn't update the rendered view.
- Pressing Ctrl-Backspace seems to do nothing when at the beginning of a container.
- If you click at the end of a line vs. if you drag to the end of the line, the app is inconsistent as to where your cursor gets displayed (at the end of the current line vs. at the beginning of the next line).
- If you type a closing parenthese (e.g. in an empty document), it throws an error in the console.
