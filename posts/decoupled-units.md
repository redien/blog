<!--
  blog - My personal blog
  Written in 2016 by Jesper Oskarsson jesosk@gmail.com

  To the extent possible under law, the author(s) have dedicated all copyright
  and related and neighboring rights to this software to the public domain worldwide.
  This software is distributed without any warranty.

  You should have received a copy of the CC0 Public Domain Dedication along with this software.
  If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
-->

<!-- meta-data: {"title": "Designing decoupled units"} -->

I’ve been thinking lately a lot about code coupling. What does it mean for two units to be coupled?

One way two units can be coupled is by directly referencing one another. When talking about functions, one could simply be using the other one:

```ocaml
type compensation = Euros of int;;
let calculate_compensation = function
    | workHours -> Euros(workHours * 20);;

let weekly_compensation = calculate_compensation(40);;
```

Or in the case of a class, one could use another class by instantiating it:
```java
interface Compensation {
    int getValue();
}

class Euros implements Compensation {
    int value;

    Euros(int value) {
        this.value = value;
    }

    void calculateCompensation(int workHours) {
        this.value = workHours * 20;
    }
}

class WeeklyCompensationCalculator {

    Foo() { bar = new Bar(); bar.set(1); }
    Int get() { return bar.get(); }
}
```

In both of these cases one unit is directly coupled to another unit by referencing its implementation and using its interface. Another way to write these units would be to inject their dependencies
