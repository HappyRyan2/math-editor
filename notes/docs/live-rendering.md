# Live Rendering
**Live Rendering** refers to the process of modifying the `MathDocument` and also modifying the rendered HTML document at the same time, as opposed to making the change on the `MathDocument` and then re-rendering the whole HTML document later. Although much more complicated to do, this is now the recommended method, for performance reasons. (Re-rendering the whole document is extremely slow, and leads to noticeable lag even on relatively small documents).

A live-rendering modification consists of the following:
- A change to the rendered HTML component, inside the HTML document
- A change to the internal MathComponent, inside the MathDocument

When performing a live-rendering modification, be sure to remember to consider the following (or else you'll introduce bugs):
- **The Rendering Map**: This is a map that lets you get the rendered version of a `MathComponent` or the `MathComponent` corresponding to a rendered HTML element. When adding, removing, or re-rendering a component, don't forget to update the rendering map.
- **Words**: When inserting or deleting a component, you could end up splitting a word in two, or merging two words together. To make sure everything is still correct, call the method `MathComponentGroup.checkWordBreaks` around the affected region.
- **Lines**: If your change involves adding or deleting a line break, you'll need to make sure that the lines are still correct.
- **Rendered Cursors**
- **Descendants**: If doing something to a CompositeMathComponent, also think about the descendants. (For example, when adding or removing a `CompositeMathComponent`, you'll also need to add or remove its descendants from the rendering map).
