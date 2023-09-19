import { app } from "../../App.mjs";
import { MathSymbol } from "../MathSymbol.mjs";

app.keyHandlers.push({
	key: "*",
	handler: () => app.cursors.forEach(cursor => cursor.addComponent(new MathSymbol("⋅"))),
});
