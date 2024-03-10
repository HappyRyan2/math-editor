[same-line -> x-dist]: Out of all the components on the line you clicked (i.e. the line that minimizes the vertical distance to your cursor), choose the component whose x-component is closest.
Problem: in a fraction, it should really use the y-distance instead. For example, what if you click on the denominator, but the component that minimizes the x-distance is in the numerator? This algorithm would put your cursor in the numerator, which doesn't feel right.


[same-line -> y-dist -> x-dist]: Out of all the components on the line you clicked, choose the one that minimizes the vertical distance, using horizontal distance as a tiebreaker.
Problem: what if there's a fraction, and you click to the far right of the end of the fraction at the same height as the numerator? The algorithm would put your cursor in the numerator since the x-distance tiebreaker never activates, but the cursor should instead go to the right (minimizing x-distance).
