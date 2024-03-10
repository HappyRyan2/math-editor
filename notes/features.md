# List of Features
## Basic Editing
- ~~Typing letters~~
- Typing basic math symbols:
	- ~~Addition and subtraction~~
	- ~~Multiplication (use a dot instead of an asterisk)~~
	- ~~Division (fractions)~~
		- ~~The user should be able to move between the numerator and denominator with the arrow keys~~
		- ~~The user should be able to delete the fraction from inside by pressing backspace at the beginning of an empty denominator~~
	- ~~Exponentiation~~
	- ~~Parentheses / brackets / braces (with pretty resizing)~~
	- Square roots and nth roots
- Basic key inputs:
	- ~~Enter: create a new line~~
	- ~~Backspace: delete the previous character or selected characters, or enter component if it's composite~~
	- Delete: delete the next character or selected characters, or enter component if it's composite
- Moving the cursor around
	- ~~Moving with left and right arrow keys~~
	- ~~Clicking to move the cursor around~~
	- Moving up and down with the arrow keys (which should intelligently deal with things like fractions)
	- Ctrl-clicking to create another cursor at the clicked location
- Highlighting and deleting
	- ~~Shift-left and shift-right: select the next or previous component~~
	- ~~Click and drag to highlight lots of components~~
	- Doubleclick and drag to highlight one word at a time

## Advanced Editing
- Fancy keyboard shortcuts:
	- ~~Ctrl-left and ctrl-right: move the cursor one word to the left or right (skipping over composite math components like fractions)~~
	- ~~Ctrl-shift-left and ctrl-shift-right: select a word to the left or right (skipping over subscripts and superscripts)~~
	- ~~Ctrl-backspace: delete the previous word (including subscripts and superscripts)~~
	- Alt-left and alt-right: move the cursor to the beginning and end of a line
	- Alt-shift-left and alt-shift-right: select to the beginning or end of a line
	- ~~Ctrl-D: select the next occurence with a multi-cursor, like in Atom or VSCode~~
		- ~~There should never be any duplicate cursors~~
	- Ctrl-F: open a find and replace dialog
	- Ctrl-C and Ctrl-V: copy and paste (ideally, it should work nicely with multi-cursors, but also save the LaTeX to the user's actual clipboard)
	- Ctrl-Shift-D: duplicate the current line (or multiple lines if you have multiple lines selected)
	- Ctrl-Shift-K: delete the current line (or multiple lines if you have multiple lines selected)
	- ~~Ctrl-A: select all~~
	- ~~Escape: remove all cursors except one~~
- Smart features:
	- "Smart subscripts": when typing a number after a letter, put it in the subscript
	- "Smart environments": automatically detect environments (Theorem, Proof, Definition, etc.) at the beginnings of lines and format them nicely
	- "Smart exponents": when the user is in an exponent and presses an operator, exit the exponent as long as it's not the first character and the first character is not a parenthese
		- Design decision: Is this actually any smarter than the default behavior (never exiting the parenthese automatically)? After all, sometimes you do want to type x^{y+z}, for example. This is how Desmos does it, but sometimes when using Desmos I am irritated by this feature.
- ~~Word wrap~~
- Advanced math symbols and features
	- ~~Greek alphabet~~
	- ~~Hebrew alphabet~~
	- Symbols from https://www.compart.com/en/unicode/category/Sm
	- Infinite products, summations, etc
	- Limits (and limsup and liminf)
	- Integrals (and maybe the weird variations? but maybe not.)
	- Headings (like in Markdown, you use #, but the #s are formatted specially at the beginning)

## File and Tab Management
- Tree view:
	- Display all the files in the working directory in the tree view (like in VSCode or Atom)
	- Click a file to open it
	- Drag files to move them around
	- Add a new working directory with Ctrl-Shift-A or Ctrl-Shift-O
	- Each folder should have a button where you can create a new file or subfolder
- Tabs:
	- ~~Tabs should be displayed at the top~~
	- ~~Click a tab to select it~~
	- ~~Click X on a tab to close it~~
	- Click and drag a tab to move it
- File and tab management keyboard shortcuts:
	- ~~Ctrl-S to save the file, with a dialog to enter the location to save to~~
	- ~~Ctrl-O to open a file~~
	- ~~Ctrl-N to create a new empty file~~
	- ~~Ctrl-W to close the current tab~~
	- ~~Ctrl-Tab and Ctrl-Shift-Tab to switch between tabs (like in Chrome or VSCode? Which is better? I decided Chrome because it's easier to implement.)~~
	- Ctrl-Shift-O to open a folder
	- Ctrl-P (or Ctrl-T) to open a file within the opened project folder

## Autocomplete
- ~~Add support for autocomplete~~
- Allow the user to edit autocomplete

## Miscellaneous QOL Features
- When the user presses Tab while at the beginning of an empty summation, limit, or other similar component, the app should copy the content of that summation/limit/etc into the current summation/limit/etc and place the user's cursor after the current summation/limit/etc.
	- Example workflow: when typing "\sum_{n=1}^\infty a_n = \sum_{n=1}^\infty b_n", the user can type "\sum_{n=1}^\infty a_n = \sum" and then press Tab, resulting in "\sum_{n=1}^\infty a_n = \sum_{n=1}^\infty". Then the user types "b_n" and is done writing the equation.
- Allow the user to open the command palette with Ctrl-Shift-P
- Line numbers should be shown in the left-hand side (perhaps with an option to let the user toggle it on and off)
- The selected line should be highlighted in light grey or something
- It would be incredibly useful if you could hover over a symbol to see its definition. But this is kind of hard to implement:
	- What exactly is the "definition"? Is it just the first occurance? That might work in some cases, but in longer documents, or with commonly-used symbols like "x", that heuristic could give incorrect results.
	- What exactly is a "symbol"? Is it just a `MathSymbol`? Probably not -- but you could say that a "symbol" is a `MathSymbol`, potentially followed by a subscript. But what about superscripts? Sometimes those are part of the variable name, although this is somewhat rare, so maybe I'm ok with false positives in this case. Also, sometimes overlines are part of the variable name, but other times they aren't (like when using an overline to represent complex conjugation).
	- The user can indicate which things are definitions, but this is in direct opposition to my goal of letting the user type as fast as possible, so I think this is a bad idea.
	- In some IDEs you can select a word or character and it will highlight all the occurances (e.g. Atom puts a little box around all of them). This could be enough to replace the jump-to-definition feature; or I could add a keyboard shortcut that jumps you to the first occurance of the selected text.
