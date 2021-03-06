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

I’ve been thinking a lot about code coupling lately. What does it actually mean for two unit of code to be coupled and in what ways can they be coupled? As high coupling is generally considered an undesired trait, how can we reduce it? Also why is it considered bad in the first place?

I wanted to write down my thoughts on coupling in a concise form so that I can better understand it myself.

##### Tight (or direct) coupling
A unit or module being it a function, type, class, method or any other abstraction, is considered tightly coupled to a second if it directly uses the other by name.

In the following Javascript example `bar` is tightly coupled to `foo` as it directly calls it by name:
```javascript
function foo(x) {
    return x;
}

function bar() {
    return foo(1);
}

console.log(bar());
```

For example, if we change `foo` like this:
```javascript
function foo(x) {
    return x + 1;
}
```
The behavior of `bar` will change as `bar(1)` would previously be `1` but now returns `2`.

A type could also be coupled to another. Take this example in C:
```c
#include "stdio.h"

typedef int foo_t;
typedef foo_t bar_t;

int main(void) {
    bar_t a = 1;
    bar_t b = 2;
    bar_t c = a / b;
    printf("%d\n", c);
    return 0;
}
```

The type `bar` changes whenever `foo` changes.

```c
typedef float foo_t;
```
Would change the value of `c` or any other unit using the type.

##### Loose (or indirect) coupling
We can rewrite the previous examples in several ways in order to reduce coupling. For example:
```javascript
function foo(x) {
    return x;
}

function bar(fooer) {
    return fooer(1);
}

function foobar() {
    return bar(foo);
}

console.log(foobar());
```

Foobar is 

##### Why loose coupling?
If one unit is coupled to another

##### "Real" example

##### Tight coupling
The strongest way in which two units can be coupled is by directly referencing one another. This means that changing the behavior of the dependency will directly change the behavior of the dependent unit.

In the case of functions, one could simply be calling the other one:

```javascript
var parse = function (expression) {
    return {
        operator: expression.substr(2, 1),
        left: parseInt(expression.substr(0, 1), 10),
        right: parseInt(expression.substr(4, 1), 10)
    };
};

var evaluate = function (expression) {
    var parsedExpression = parse(expression);

    if (parsedExpression.operator === "+") {
        return parsedExpression.left + parsedExpression.right;
    } else {
        return parsedExpression.left - parsedExpression.right;
    }
};

console.log(evaluate("1 + 2"));
```

In this example, `evaluate` is said to be tightly coupled with `parse` since it calls it directly by name. Any time `parse` changes, `evaluate` will also change.

We can also write the same implementation using object orientation:

```java

class Expression {
    String operator;
    int left, right;

    public void parse(String expression) {
        operator = expression.substring(2, 3);
        left = Integer.parseInt(expression.substring(0, 1));
        right = Integer.parseInt(expression.substring(4, 5));
    }

    public String getOperator() { return operator; }
    public int getLeft() { return left; }
    public int getRight() { return right; }
}

class ExpressionEvaluator {
    Expression expression = new Expression();

    public ExpressionEvaluator(String expressionString) {
        expression.parse(expressionString);
    }

    public int evaluate() {
        if (expression.getOperator().equals("+")) {
            return expression.getLeft() + expression.getRight();
        } else {
            return expression.getLeft() - expression.getRight();
        }
    }
}

class Main {
    public static void main(String[] args) {
        ExpressionEvaluator evaluator = new ExpressionEvaluator("1 + 2");
        System.out.println(evaluator.evaluate());
    }
}
```
These implementations makes it impossible to test the evaluator in isolation since it directly references the parser.

What we can do to reduce coupling is to change our evaluator to take the parser as a dependency, which is known as [dependency injection](https://en.wikipedia.org/wiki/Dependency_injection). (This can also be seen as implementing the [strategy pattern](https://en.wikipedia.org/wiki/Strategy_pattern).)

##### Loose coupling
Looking back at our first example we can pass the `evaluate` function a `parser` that parses the expression:

```javascript
var parse = function (expression) {
    return {
        operator: expression.substr(2, 1),
        left: parseInt(expression.substr(0, 1), 10),
        right: parseInt(expression.substr(4, 1), 10)
    };
};

var evaluate = function (parser, expression) {
    var parsedExpression = parser(expression);

    if (parsedExpression.operator === "+") {
        return parsedExpression.left + parsedExpression.right;
    } else {
        return parsedExpression.left - parsedExpression.right;
    }
};

console.log(evaluate(parse, "1 + 2"));
```

We can do the same thing with our `ExpressionEvaluator` class and pass in the `Expression` as an implementation of an interface:

```java

interface Expression {
    public void parse(String expression);

    public String getOperator();
    public int getLeft();
    public int getRight();
}

class InfixExpression implements Expression {
    String operator;
    int left, right;

    public void parse(String expression) {
        operator = expression.substring(2, 3);
        left = Integer.parseInt(expression.substring(0, 1));
        right = Integer.parseInt(expression.substring(4, 5));
    }

    public String getOperator() { return operator; }
    public int getLeft() { return left; }
    public int getRight() { return right; }
}

class ExpressionEvaluator {
    Expression expression;

    public ExpressionEvaluator(Expression expression, String expressionString) {
        this.expression = expression;
        expression.parse(expressionString);
    }

    public int evaluate() {
        if (expression.getOperator().equals("+")) {
            return expression.getLeft() + expression.getRight();
        } else {
            return expression.getLeft() - expression.getRight();
        }
    }
}

class Main {
    public static void main(String[] args) {
        Expression expression = new InfixExpression();
        ExpressionEvaluator evaluator = new ExpressionEvaluator(expression, "1 + 2");
        System.out.println(evaluator.evaluate());
    }
}
```

Both implementations are now loosely coupled since the evaluators do not directly depend on the parser implementations which means that we can swap out the parsers for other ones. For example, this makes it possible to mock out our parser for a dummy one and test the evaluator in isolation. We could also write a parser to parse prefix notation instead of infix. (Something like `+ 1 2`.)

##### More loosely coupled?
However, our interfaces are still constrained more than they need to be. For example, the evaluator still takes a string with the expression to be evaluated and passes it to the parser. This means that our evaluator is coupled to the input data structure of the parser. The evaluator does not actually need to depend on the fact that the expression is parsed from a string.

Let's think a bit more about what data structures we are using and how we can reduce unnecessary coupling:

- Our parser takes as input a string with a certain format. We have not defined how this string should be formatted so this depends on the implementation of our parser.
- The parser outputs three values, an operator as a string, a left and a right addend as signed integers.
- Our evaluator takes the before mentioned output from the parser and outputs a signed integer with the result of the evaluation.

Let's fix the evaluator knowing about the input string:

```javascript
var parse = function (expression) {
    return {
        operator: expression.substr(2, 1),
        left: parseInt(expression.substr(0, 1), 10),
        right: parseInt(expression.substr(4, 1), 10)
    };
};

var evaluate = function (parsedExpression) {
    if (parsedExpression.operator === "+") {
        return parsedExpression.left + parsedExpression.right;
    } else {
        return parsedExpression.left - parsedExpression.right;
    }
};

console.log(evaluate(parse("1 + 2")));
```

```java
interface Expression {
    public String getOperator();
    public int getLeft();
    public int getRight();
}

class InfixExpression implements Expression {
    String operator;
    int left, right;

    public InfixExpression(String expression) {
        parse(expression);
    }

    void parse(String expression) {
        operator = expression.substring(2, 3);
        left = Integer.parseInt(expression.substring(0, 1));
        right = Integer.parseInt(expression.substring(4, 5));
    }

    public String getOperator() { return operator; }
    public int getLeft() { return left; }
    public int getRight() { return right; }
}

class ExpressionEvaluator {
    Expression expression;

    public ExpressionEvaluator(Expression expression) {
        this.expression = expression;
    }

    public int evaluate() {
        if (expression.getOperator().equals("+")) {
            return expression.getLeft() + expression.getRight();
        } else {
            return expression.getLeft() - expression.getRight();
        }
    }
}

class Main {
    public static void main(String[] args) {
        Expression expression = new InfixExpression("1 + 2");
        ExpressionEvaluator evaluator = new ExpressionEvaluator(expression);
        System.out.println(evaluator.evaluate());
    }
}
```

We are now free to use the parser on its own and do anything we'd like with the output, like create an infix to postfix translator or save the parsed expression to disk and evaluate it later without the need to parse it again. We can also easily test our implementations in isolation without the need for any mock objects.

From the perspective of the user of this code, it now looks something like this:

```
string -> [parser] -> (string, int, int) -> [evaluator] -> int
```

And this is how it looked when we started:

```
string -> [evaluator] -> int
```

We had no idea there even was a parser, this was simply an implementation detail. Now that we have decoupled these two units we have exposed an additional interface. What are the drawbacks of this?

##### Importance of data structures
Since we now depend on the output of the parser.

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
