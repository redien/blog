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

I’ve been thinking a lot about code coupling lately. What does it actually mean for two units to be coupled and in what ways can they be coupled? Maybe more importantly: how can we decouple them?

##### Tight coupling
The strongest way in which two units can be coupled is by directly referencing one another. In the case of functions, one could simply be calling the other one:

```javascript
var expression = "1 + 2";

var OPERATOR_PLUS = 0;
var OPERATOR_MINUS = 1;

var parse = function (expression) {
    var operator;

    if (expression.substr(2, 1) === '+') {
        operator = OPERATOR_PLUS;
    } else {
        operator = OPERATOR_MINUS;
    }

    return {
        operator: operator,
        left: parseInt(expression.substr(0, 1), 10),
        right: parseInt(expression.substr(4, 1), 10)
    };
};

var evaluate = function (expression) {
    var ast = parse(expression);

    if (ast.operator === OPERATOR_PLUS) {
        return ast.left + ast.right;
    } else {
        return ast.left - ast.right;
    }
};
```

In this example, `calculate` is said to be tightly coupled with `parse` since it calls it directly by name. Any time `parse` changes, `calculate` will also change.

Looking instead at two classes using the same problem of parsing an expression:

```java
class ExpressionParser {
    public enum Operator {
        Plus,
        Minus
    }

    Operator operator;
    int left, right;

    public void parse(String expression) {
        if (expression.substring(2, 3).equals("+")) {
            operator = Operator.Plus;
        } else {
            operator = Operator.Minus;
        }

        left = Integer.parseInt(expression.substring(0, 1));
        right = Integer.parseInt(expression.substring(4, 5));
    }

    public Operator getOperator() { return operator; }
    public int getLeft() { return left; }
    public int getRight() { return right; }
}

class ExpressionEvaluator {
    ExpressionParser parser;

    public ExpressionEvaluator(String expression) {
        this.parser = new ExpressionParser();
        parser.parse(expression);
    }

    public int evaluate() {
        if (parser.getOperator() == ExpressionParser.Operator.Plus) {
            return parser.getLeft() + parser.getRight();
        } else {
            return parser.getLeft() - parser.getRight();
        }
    }
}
```
These implementations makes it impossible to test the evaluator in isolation since it directly references the parser.

What we can do to reduce coupling, is to [change our evaluator to take the parser as a dependency](https://en.wikipedia.org/wiki/Dependency_injection).

##### Loose coupling
Looking back at our first example we can pass the `evaluate` function a `parser` that parses the expression:

```javascript
var expression = "1 + 2";

var OPERATOR_PLUS = 0;
var OPERATOR_MINUS = 1;

var parse = function (expression) {
    var operator;

    if (expression.substr(2, 1) === '+') {
        operator = OPERATOR_PLUS;
    } else {
        operator = OPERATOR_MINUS;
    }

    return {
        operator: operator,
        left: parseInt(expression.substr(0, 1), 10),
        right: parseInt(expression.substr(4, 1), 10)
    };
};

var evaluate = function (parser, expression) {
    var ast = parser(expression);

    if (ast.operator === OPERATOR_PLUS) {
        return ast.left + ast.right;
    } else {
        return ast.left - ast.right;
    }
};
```

We can do the same thing with our `ExpressionEvaluator` class and pass in the `ExpressionParser` as an implementation of an interface:

```java
interface ExpressionParser {
    public enum Operator {
        Plus,
        Minus
    }

    public void parse(String expression);

    public Operator getOperator();
    public int getLeft();
    public int getRight();
}

class InfixExpressionParser implements ExpressionParser {
    Operator operator;
    int left, right;

    public void parse(String expression) {
        if (expression.substring(2, 3).equals("+")) {
            operator = Operator.Plus;
        } else {
            operator = Operator.Minus;
        }

        left = Integer.parseInt(expression.substring(0, 1));
        right = Integer.parseInt(expression.substring(4, 5));
    }

    public Operator getOperator() { return operator; }
    public int getLeft() { return left; }
    public int getRight() { return right; }
}

class ExpressionEvaluator {
    ExpressionParser parser;

    public ExpressionEvaluator(ExpressionParser parser, String expression) {
        this.parser = parser;
        parser.parse(expression);
    }

    public int evaluate() {
        if (parser.getOperator() == ExpressionParser.Operator.Plus) {
            return parser.getLeft() + parser.getRight();
        } else {
            return parser.getLeft() - parser.getRight();
        }
    }
}
```

Both implementations are now loosely coupled since the evaluators do not directly depend on the parser implementations which means that we can swap out the parsers for another. This makes it possible to mock out our parser for a dummy one and test the evaluator in isolation. We could for example write a parser to parse prefix notation instead. (Something like `+ 1 2`.)

##### More loosely coupled?
However, our interfaces are still constrained more than they need to be. For example, the evaluator still takes a string with the expression to be evaluated and passes it to the parser. The evaluator implementation is actually not dependent on the fact that the expression is parsed from a string.


<!--
```ocaml
let expression = "1 + 2";;

let parse = function
    | expression -> (String.sub expression 2 1),
                    int_of_string (String.sub expression 0 1),
                    int_of_string (String.sub expression 4 1);;

let calculate = function
    | "-", left, right -> left - right
    | "+", left, right -> left + right;;

let evaluate = function
    | expression -> calculate (parse expression);;
```
-->
