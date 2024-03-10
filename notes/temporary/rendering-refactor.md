Note to self: use branches this time!

# Attempt 1
To render the document:
- Split the document into lines.
	- Each line ends in a line break and includes that line break.
	- If the last line has a line break at the end, include an empty line.
- For each line, get the list of cursors that the line contains.
	- Cursors after a line break should display on the next line. This means a line L "contains" a cursor C if and only if the MathComponent after C is inside L, or if C is at the end of the document and L does not end in a LineBreak.
- For each line, merge the MathComponents and the Cursors into one list where each Cursor appears in the proper location.
- Render each line (including the Cursors) by rendering each MathComponent/Cursor individually and then putting them all together in a `<span>`.
	- This will be done using a `static` method on MathComponentGroup.
	- This should also create the rendering map.
- Put all the rendered lines together

Wait, what about words?

# Attempt 2
