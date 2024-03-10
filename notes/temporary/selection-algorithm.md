Increasing selection:
- If there is a next component:
	- [1] Select the next component (selection is initially empty)
	- [2] Select the next component (selection is initially nonempty)
- If there is no next component:
	- If the containing component is a Line:
		- [3] Do nothing (selection is initially empty)
		- [4] Do nothing (selection is initially nonempty)
	- If the component is not a Line:
		- [5] Select the containing component (selection is initially empty)
		- [6] Select the containing component (selection is initially nonempty)

Decreasing selection (selection is initially nonempty for all of these cases):
- If there is a next component:
	- [7] Deselect the next component (selection is now empty)
	- [8] Deselect the next component (selection is still nonempty)
- If there is no next component: this should never happen


THE ALGORITHM:
- If there is a next component:
	- Move past it
	- Change the start/end of the selection
- If there is no next component and the container is not a Line:
	- Put the cursor to the right of the container
	- Select the container (and nothing else)
