function parse() {
    // Daten aus Formular auslesen, Zugriff über id-Tag
    let term = document.getElementById("term").value;
    let varX = parseFloat(document.getElementById("varx").value);
    let myFunction = new ParserInTypeScript.MathFunction(term);
    let myError = myFunction.Error;
    switch (myError) {
        case ParserInTypeScript.ErrorTyp.No: {
            let myCalc = new ParserInTypeScript.Calc(myFunction);
            try {
                let result = myCalc.CalcValue(varX);
                document.getElementById("result").value = result.toString();
            }
            catch (_a) { }
            break;
        }
        case ParserInTypeScript.ErrorTyp.Resolve: {
            break;
        }
    }
}
var ParserInTypeScript;
(function (ParserInTypeScript) {
    let OpTyp;
    (function (OpTyp) {
        OpTyp[OpTyp["No"] = 0] = "No";
        OpTyp[OpTyp["Sin"] = 1] = "Sin";
        OpTyp[OpTyp["Cos"] = 2] = "Cos";
        OpTyp[OpTyp["Tan"] = 3] = "Tan";
        OpTyp[OpTyp["Pow"] = 4] = "Pow";
        OpTyp[OpTyp["Add"] = 5] = "Add";
        OpTyp[OpTyp["Sub"] = 6] = "Sub";
        OpTyp[OpTyp["Mul"] = 7] = "Mul";
        OpTyp[OpTyp["Div"] = 8] = "Div";
        OpTyp[OpTyp["Var"] = 9] = "Var";
        OpTyp[OpTyp["Num"] = 10] = "Num";
        OpTyp[OpTyp["Pi"] = 11] = "Pi";
        OpTyp[OpTyp["Sqr"] = 12] = "Sqr";
        OpTyp[OpTyp["Lg"] = 13] = "Lg";
        OpTyp[OpTyp["Fak"] = 14] = "Fak";
    })(OpTyp = ParserInTypeScript.OpTyp || (ParserInTypeScript.OpTyp = {}));
    let ErrorTyp;
    (function (ErrorTyp) {
        ErrorTyp[ErrorTyp["No"] = 0] = "No";
        ErrorTyp[ErrorTyp["Resolve"] = 1] = "Resolve";
        ErrorTyp[ErrorTyp["Calc"] = 2] = "Calc";
    })(ErrorTyp = ParserInTypeScript.ErrorTyp || (ParserInTypeScript.ErrorTyp = {}));
    class MathFunction {
        constructor(term) {
            this.Term = term;
            if ((this.TestTerm(term) == true)) {
                term = term.toLowerCase();
                let index = -1;
                this.Error = ErrorTyp.No;
                let data = this.ExploreTerm(term, index);
                this.Term = data.term;
                term = data.term;
                this.Typ = data.typ;
                index = data.Index;
                if (((this.Typ == OpTyp.Div)
                    || ((this.Typ == OpTyp.Sub)
                        || ((this.Typ == OpTyp.Mul)
                            || ((this.Typ == OpTyp.Add)
                                || (this.Typ == OpTyp.Pow)))))) {
                    let termPart1 = term.substring(0, index);
                    let termPart2 = term.substring((index + 1), (term.length)); //
                    this.ChildLeft = new MathFunction(termPart1);
                    this.ChildRight = new MathFunction(termPart2);
                }
                else if (((this.Typ == OpTyp.Sin)
                    || ((this.Typ == OpTyp.Cos)
                        || ((this.Typ == OpTyp.Tan)
                            || ((this.Typ == OpTyp.Sqr)
                                || (this.Typ == OpTyp.Lg)))))) {
                    let teilTerm;
                    let startPosition = term.indexOf("(");
                    teilTerm = term.substring((startPosition + 1), (term.length - 1)); //
                    this.ChildLeft = new MathFunction(teilTerm);
                }
                else if ((this.Typ == OpTyp.Fak)) {
                    let teilTerm;
                    teilTerm = term.substring(0, (term.length - 1)); //
                    this.ChildLeft = new MathFunction(teilTerm);
                }
            }
            else {
                this.Error = ErrorTyp.Resolve;
            }
        }
        GetIndex(term, searchChar) {
            let index = -1;
            //  Search for operators, e.g.: +, -, *, /, ^          
            let niveauOfBrackets = 0;
            for (let i = 0; (i < term.length); i++) {
                if ((term[i].toString() == "(")) {
                    niveauOfBrackets++;
                }
                else if ((term[i].toString() == ")")) {
                    niveauOfBrackets--;
                }
                if (((term[i].toString() == searchChar)
                    && (niveauOfBrackets == 0))) {
                    index = i;
                }
            }
            return index;
        }
        ExploreTerm(term, Index) {
            let typ = OpTyp.No;
            let index = -1;
            let ergebnis = false;
            do {
                if (((this.GetIndex(term, "+") == -1) && ((this.GetIndex(term, "-") == -1) && ((this.GetIndex(term, "*") == -1) && ((this.GetIndex(term, "/") == -1) && (this.GetIndex(term, "^") == -1)))))) {
                    // Klammern entfernen
                    if ((term.startsWith("(") && term.endsWith(")"))) {
                        term = term.substring(1, (term.length - 1));
                        ergebnis = true;
                    }
                    else {
                        ergebnis = false;
                    }
                }
                else {
                    ergebnis = false;
                }
            } while (ergebnis == true);
            if ((term.startsWith("-sin(")
                || (term.startsWith("-cos(")
                    || (term.startsWith("-tan(")
                        || (term.startsWith("-sqrt(")
                            || (term.startsWith("-lg(")
                                || (term.startsWith("-ln(")
                                    || (term.startsWith("-lb(")
                                        || (term.startsWith("-x") || term.startsWith("-(")))))))))) {
                let subTerm = term.substring(1);
                term = ("-1*" + subTerm);
            }
            if ((term == "x")) {
                typ = OpTyp.Var;
            }
            if ((term == "pi")) {
                typ = OpTyp.Pi;
            }
            else {
                //  Sinus, Kosinus, Tangens, Quadratwurzel, Logarithmus
                if (term.startsWith("sin(")) {
                    typ = OpTyp.Sin;
                }
                else if (term.startsWith("cos(")) {
                    typ = OpTyp.Cos;
                }
                else if (term.startsWith("tan(")) {
                    typ = OpTyp.Tan;
                }
                else if (term.startsWith("sqrt(")) {
                    typ = OpTyp.Sqr;
                }
                else if (term.startsWith("lg(")) {
                    typ = OpTyp.Lg;
                }
                //  Fakultät
                if ((this.GetIndex(term, "!") > -1)) {
                    index = this.GetIndex(term, "!");
                    typ = OpTyp.Fak;
                }
                //  Potenzrechnung
                if ((this.GetIndex(term, "^") > -1)) {
                    index = this.GetIndex(term, "^");
                    typ = OpTyp.Pow;
                }
                //  Punktrechnung
                if ((this.GetIndex(term, "/") > -1)) {
                    index = this.GetIndex(term, "/");
                    typ = OpTyp.Div;
                }
                if ((this.GetIndex(term, "*") > -1)) {
                    index = this.GetIndex(term, "*");
                    typ = OpTyp.Mul;
                }
                //  Strichrechnung
                if ((this.GetIndex(term, "-") > 0)) {
                    index = this.GetIndex(term, "-");
                    typ = OpTyp.Sub;
                }
                if ((this.GetIndex(term, "+") > -1)) {
                    index = this.GetIndex(term, "+");
                    typ = OpTyp.Add;
                }
            }
            //   Prüfen, ob die Umwandlung in eine Zahl möglich ist
            if ((typ == OpTyp.No)) {
                try {
                    parseFloat(term);
                    typ = OpTyp.Num;
                }
                catch (_a) {
                    this.Error = ErrorTyp.Resolve;
                }
            }
            Index = index;
            return {
                typ, Index, term
            };
        }
        TestTerm(term) {
            let result = false;
            let number = 0;
            for (let i = 0; (i < term.length); i++) {
                if ((term[i].toString() == "(")) {
                    number++;
                }
                else if ((term[i].toString() == ")")) {
                    number--;
                }
            }
            if ((number == 0)) {
                result = true;
            }
            return result;
        }
    }
    ParserInTypeScript.MathFunction = MathFunction;
    class Calc {
        constructor(func) {
            this.f = func;
        }
        set Error(value) {
        }
        CalcValue(x) {
            let result = 0;
            let value1;
            let value2;
            if (((this.f.Typ == OpTyp.Div)
                || ((this.f.Typ == OpTyp.Sub)
                    || ((this.f.Typ == OpTyp.Mul)
                        || ((this.f.Typ == OpTyp.Add)
                            || (this.f.Typ == OpTyp.Pow)))))) {
                let calcLeft = new Calc(this.f.ChildLeft);
                value1 = calcLeft.CalcValue(x);
                let calcRight = new Calc(this.f.ChildRight);
                value2 = calcRight.CalcValue(x);
                if (((this.f.ChildLeft.Error == ErrorTyp.No)
                    && (this.f.ChildLeft.Error == ErrorTyp.No))) {
                    switch (this.f.Typ) {
                        case OpTyp.Add:
                            result = (value1 + value2);
                            break;
                        case OpTyp.Sub:
                            result = (value1 - value2);
                            break;
                        case OpTyp.Mul:
                            result = (value1 * value2);
                            break;
                        case OpTyp.Div:
                            if ((value2 != 0)) {
                                result = (value1 / value2);
                            }
                            else {
                                this.Error = ErrorTyp.Calc;
                            }
                            break;
                        case OpTyp.Pow:
                            result = Math.pow(value1, value2);
                            break;
                    }
                }
                else {
                    this.Error = ErrorTyp.Calc;
                }
            }
            else if ((this.f.Typ == OpTyp.Sin)) {
                let calcLeft = new Calc(this.f.ChildLeft);
                value1 = calcLeft.CalcValue(x);
                result = Math.sin(value1);
            }
            else if ((this.f.Typ == OpTyp.Cos)) {
                let calcLeft = new Calc(this.f.ChildLeft);
                value1 = calcLeft.CalcValue(x);
                result = Math.cos(value1);
            }
            else if ((this.f.Typ == OpTyp.Tan)) {
                try {
                    let calcLeft = new Calc(this.f.ChildLeft);
                    value1 = calcLeft.CalcValue(x);
                    result = Math.tan(value1);
                }
                catch (_a) {
                    this.Error = ErrorTyp.Calc;
                }
            }
            else if ((this.f.Typ == OpTyp.Sqr)) {
                let calcLeft = new Calc(this.f.ChildLeft);
                value1 = calcLeft.CalcValue(x);
                if ((value1 >= 0)) {
                    result = Math.sqrt(value1);
                }
                else {
                    this.Error = ErrorTyp.Calc;
                }
            }
            else if ((this.f.Typ == OpTyp.Lg)) {
                let calcLeft = new Calc(this.f.ChildLeft);
                value1 = calcLeft.CalcValue(x);
                if ((value1 >= 0)) {
                    result = Math.log10(value1);
                }
                else {
                    this.Error = ErrorTyp.Calc;
                }
            }
            else if ((this.f.Typ == OpTyp.Fak)) {
                let calcLeft = new Calc(this.f.ChildLeft);
                value1 = calcLeft.CalcValue(x);
                if ((value1 >= 0)) {
                    if ((value1 == 0)) {
                        result = 1;
                    }
                    else if ((value1 == 1)) {
                        result = 1;
                    }
                    else {
                        result = value1;
                        for (let i = ((value1) - 1); (i > 0); i--) {
                            result = (result * i);
                        }
                    }
                }
                else {
                    this.Error = ErrorTyp.Calc;
                }
            }
            else if ((this.f.Typ == OpTyp.Var)) {
                result = x;
            }
            else if ((this.f.Typ == OpTyp.Pi)) {
                result = Math.PI;
            }
            else if ((this.f.Typ == OpTyp.Num)) {
                result = parseFloat(this.f.Term);
            }
            return result;
        }
    }
    ParserInTypeScript.Calc = Calc;
})(ParserInTypeScript || (ParserInTypeScript = {}));
//# sourceMappingURL=parser.js.map