function parse() {

    // Daten aus Formular auslesen, Zugriff über id-Tag
    let term = (document.getElementById("term") as HTMLInputElement).value;
    let varX = parseFloat((document.getElementById("varx") as HTMLInputElement).value)


    let myFunction = new ParserInTypeScript.MathFunction(term);
    let myError = myFunction.Error;
    switch (myError) {

        case ParserInTypeScript.ErrorTyp.No: {
            let myCalc = new ParserInTypeScript.Calc(myFunction);
            try {
                let result = myCalc.CalcValue(varX);
                (document.getElementById("result") as HTMLInputElement).value = result.toString();

            }
            catch { }
            break;
        }
        case ParserInTypeScript.ErrorTyp.Resolve: {
            break;
        }
    }
}


module ParserInTypeScript {

    export enum OpTyp {
        No,
        Sin,
        Cos,
        Tan,
        Pow,
        Add,
        Sub,
        Mul,
        Div,
        Var,
        Num,
        Pi,
        Sqr,
        Lg,
        Fak,
    }

    export enum ErrorTyp {
        No,
        Resolve,
        Calc,
    }

    export class MathFunction {

        public Term: string;
        public ChildLeft: MathFunction;
        public ChildRight: MathFunction
        public Typ: OpTyp;
        public Error: ErrorTyp;

        private GetIndex(term: string, searchChar: string): number {
            let index: number = -1;
            //  Search for operators, e.g.: +, -, *, /, ^          
            let niveauOfBrackets: number = 0;
            for (let i: number = 0; (i < term.length); i++) {
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

        private ExploreTerm(term: string, Index: number) {
            let typ: OpTyp = OpTyp.No;
            let index: number = -1;
            let ergebnis: boolean = false;
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
                else { ergebnis = false; }
            }
            while (ergebnis == true)

            if ((term.startsWith("-sin(")
                || (term.startsWith("-cos(")
                    || (term.startsWith("-tan(")
                        || (term.startsWith("-sqrt(")
                            || (term.startsWith("-lg(")
                                || (term.startsWith("-ln(")
                                    || (term.startsWith("-lb(")
                                        || (term.startsWith("-x") || term.startsWith("-(")))))))))) {
                let subTerm: string = term.substring(1);
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
                    parseFloat(term)
                    typ = OpTyp.Num;
                }
                catch {
                    this.Error = ErrorTyp.Resolve;
                }

            }

            Index = index;
            return {
                typ, Index, term
            }
        }

        private TestTerm(term: string): boolean {
            let result: boolean = false;
            let number: number = 0;
            for (let i: number = 0; (i < term.length); i++) {
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

        public constructor(term: string) {
            this.Term = term;
            if ((this.TestTerm(term) == true)) {
                term = term.toLowerCase();
                let index: number = -1;
                this.Error = ErrorTyp.No;
                let data = this.ExploreTerm(term, index);
                this.Term=data.term;
                term=data.term;
                this.Typ = data.typ;
                index = data.Index;
                if (((this.Typ == OpTyp.Div)
                    || ((this.Typ == OpTyp.Sub)
                        || ((this.Typ == OpTyp.Mul)
                            || ((this.Typ == OpTyp.Add)
                                || (this.Typ == OpTyp.Pow)))))) {
                    let termPart1: string = term.substring(0, index);
                    let termPart2: string = term.substring((index + 1), (term.length)); //
                    this.ChildLeft = new MathFunction(termPart1);
                    this.ChildRight = new MathFunction(termPart2);
                }
                else if (((this.Typ == OpTyp.Sin)
                    || ((this.Typ == OpTyp.Cos)
                        || ((this.Typ == OpTyp.Tan)
                            || ((this.Typ == OpTyp.Sqr)
                                || (this.Typ == OpTyp.Lg)))))) {
                    let teilTerm: string;
                    let startPosition: number = term.indexOf("(");
                    teilTerm = term.substring((startPosition + 1), (term.length - 1)); //
                    this.ChildLeft = new MathFunction(teilTerm);
                }
                else if ((this.Typ == OpTyp.Fak)) {
                    let teilTerm: string;
                    teilTerm = term.substring(0, (term.length - 1)); //
                    this.ChildLeft = new MathFunction(teilTerm);
                }

            }
            else {
                this.Error = ErrorTyp.Resolve;
            }

        }
    }

    export class Calc {

        public set Error(value: ErrorTyp) {
        }

        private f: MathFunction;

        public constructor(func: MathFunction) {
            this.f = func;
        }

        public CalcValue(x: number): number {
            let result: number = 0;
            let value1: number;
            let value2: number;
            if (((this.f.Typ == OpTyp.Div)
                || ((this.f.Typ == OpTyp.Sub)
                    || ((this.f.Typ == OpTyp.Mul)
                        || ((this.f.Typ == OpTyp.Add)
                            || (this.f.Typ == OpTyp.Pow)))))) {
                let calcLeft: Calc = new Calc(this.f.ChildLeft);
                value1 = calcLeft.CalcValue(x);
                let calcRight: Calc = new Calc(this.f.ChildRight);
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
                            result = Math.pow(value1, value2)
                            break;
                    }

                }
                else {
                    this.Error = ErrorTyp.Calc;
                }

            }
            else if ((this.f.Typ == OpTyp.Sin)) {
                let calcLeft: Calc = new Calc(this.f.ChildLeft);
                value1 = calcLeft.CalcValue(x);
                result = Math.sin(value1);
            }
            else if ((this.f.Typ == OpTyp.Cos)) {
                let calcLeft: Calc = new Calc(this.f.ChildLeft);
                value1 = calcLeft.CalcValue(x);
                result = Math.cos(value1);
            }
            else if ((this.f.Typ == OpTyp.Tan)) {
                try {
                    let calcLeft: Calc = new Calc(this.f.ChildLeft);
                    value1 = calcLeft.CalcValue(x);
                    result = Math.tan(value1);
                }
                catch {
                    this.Error = ErrorTyp.Calc;
                }

            }
            else if ((this.f.Typ == OpTyp.Sqr)) {
                let calcLeft: Calc = new Calc(this.f.ChildLeft);
                value1 = calcLeft.CalcValue(x);
                if ((value1 >= 0)) {
                    result = Math.sqrt(value1);
                }
                else {
                    this.Error = ErrorTyp.Calc;
                }

            }
            else if ((this.f.Typ == OpTyp.Lg)) {
                let calcLeft: Calc = new Calc(this.f.ChildLeft);
                value1 = calcLeft.CalcValue(x);
                if ((value1 >= 0)) {
                    result = Math.log10(value1);
                }
                else {
                    this.Error = ErrorTyp.Calc;
                }

            }
            else if ((this.f.Typ == OpTyp.Fak)) {
                let calcLeft: Calc = new Calc(this.f.ChildLeft);
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
                        for (let i: number = ((<number>(value1)) - 1); (i > 0); i--) {
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
}
