# Things to Refactor
- `CompositeMathComponent.descendants` can use the iterator on `CompositeMathComponent` instead of two nested for loops
- Remove the code duplication in `MathComponentGroup.render` and `MathComponentGroup.renderWithMapping`
- Lots of things use `HTMLElements`, which is a problem since some propertes (e.g. `children`) return values of type `Element`. These values often need to be type-coerced back into `HTMLElements`, which might lead to bugs that TypeScript's type checker won't detect. Therefore I should probably change everything to be of type `Element`.

## Performance
Note: only fix performance issues if the app starts getting slow.
- `MathComponent.lastComponentAncestor` finds the ancestor by recursively calling itself on the container, but the container is found using a lookup over the whole document. If the component is very deep inside the document, it will run a lot of documet-wide lookups and could be very slow. Instead you could make it so it looks at the top-level components in the document and checks to see which one contains it (using a search over all the descendants).

## The New Key Handler System
Currently, there are two types of key handlers (ordinary key handlers, which are stored in `App.keyHandlers`, and relative key handlers, which are stored on each `MathComponent`). There is also a completely separate method for handling character keys. These systems can lead to problems when you need to, for example, set priority for one handler over another.

The new way of handling keys will have only one system: an array of key handlers stored globally (on the `App` object), kind of like how `App.keyHandlers` is currently. However, these new key handlers will be more general and will be able to handle all the types above. They will have the following properties:
- `key`: which key the handler should activate on. This can be a string or a regular expression.
- `relativeComponents`: this will be some kind of data structure including:
	- `componentType`: an object class (i.e. a constructor) to indicate which types of object the requirement should apply to.
	- `positions`: an array containing any or all of `"before"`, `"after"`, or `["inside", <number>]` where the number indicates which of the component groups the cursor should be inside in order to activate this handler.
- `criteria`: this method should return whether or not the key handler is applicable right now. The key handler will only be handled if the `criteria` method returns true AND [there is a component matching `relativeComponents` in the correct position OR `relativeComponents` is empty].
- `callback`: this is the method to run when the key handler is activated.
- `name`: the name of the key handler, describing what happens when `callback` is run. This is used for setting priority (see below).

At most one key handler will be run when the user presses a key (in the old system, this is like if `stopPropagation` was called automatically after every key handler). If a key handler isn't applicable, that should be communicated through the `criteria` method, as opposed to running a check inside `callback` and deciding whether or not to call `stopPropagation` (which is how it worked in the old system).

This system can handle all three types of key handlers from the old system:
- Character key handlers can now be handled by a single key handler with `key` set to a regex that matches all single-character strings.
- Ordinary (non-relative) key handlers can be handled, obviously.
- Relative key handlers can be handled by using the `relativeComponents` property.

To set priority, you should call the static method `KeyHandler.setPriority` with a list of names, where the order indicates the priority.

After everything is initialized, the app will run a method that checks that every set of conflicting key handlers (i.e. handlers that can activate on the same input) has had the priority indicated by `KeyHandler.setPriority`. If not, it throws an error to remind you (the developer) to set priority for your key handlers.

Potential problems: string-string overlap detection is easy (just check if they're the same), and string-regex overlap detection is also easy (just check if the string satisfies the regex), but what do you do about regex-regex overlap detection?

Possible solution: make it so that the `key` property is always a string or `null`, where `null` indicates that the handler should apply to all single-character keys (like `"x"` but not `"ArrowLeft"`, for example). This works for my use cases since the only case where I would need a regex was to use a regex that matched all single-character strings (for inserting ordinary characters when you pressed a key).
