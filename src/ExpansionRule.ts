export default class ExpansionRule {
  expStr1: string = "";
  expStr2: string = "";
  expStr3: string = "";
  threshold1: number = 0.33;
  threshold2: number = 0.66;
  constructor(es1: string, es2: string, es3: string, th1: number, th2:number) {
    this.expStr1 = es1;
    this.expStr2 = es2;
    this.expStr3 = es3;
    this.threshold1 = Math.max(0.0, Math.min(th1, 1.0));
    this.threshold2 = Math.max(0.0, Math.min(th2, 1.0));
  }

  expand(): string {
    let rn = Math.random();
    return rn < this.threshold1? this.expStr1 : (rn < this.threshold2? this.expStr2 : this.expStr3);
  }
}