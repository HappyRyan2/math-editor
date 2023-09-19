import { app } from "../../App.mjs";
import { Fraction } from "../Fraction.mjs";

app.keyHandlers.push({
	key: "/",
	handler: () => app.cursors.forEach(cursor => Fraction.insertFraction(cursor, app.document)),
});
