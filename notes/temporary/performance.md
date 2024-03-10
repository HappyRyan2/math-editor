fromDrag calls fromClick and selectBetween.
fromClick calls depth a few times (once for every element you clicked on)

Todo:
- Automate the generation of large files for testing purposes (use a loop in the debug settings to add 10000 characters)
- Add logging to see how often the mouseMove event fires (is it really often?)
	- If it is very often, add some code that makes it so the mouseMove event only fires every 100 milliseconds and see if that fixes the problem.
- Change MathSymbol.render to output a string instead of a span; see if this makes it faster (remember, the app re-renders every time you add a character or select something).
