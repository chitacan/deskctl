export class Ref {
  static MAX_POS = 5000;

  constructor(array) {
    this.raw = array.join(" ");
    this.pos = array.slice(0, 2);
    this.status = array[2];
    this.speed = array[3];
  }

  getPos(type) {
    const value = Math.min(
      Buffer.from(this.pos.join(""), "hex").readUInt16LE(),
      Ref.MAX_POS
    );
    if (type === "%") {
      return Math.floor((value / Ref.MAX_POS) * 100);
    } else if (type === "cm") {
      return Math.floor(value / 98);
    }
    return value;
  }
}

export class Status {
  constructor(buffer) {
    const raw = buffer.toString("hex").match(/.{1,2}/g);
    this.raw = raw.join(" ");

    // 0x03: init
    // 0x04: get status
    // 0x05: move
    // 0x06: get extended
    this.reportId = raw.slice(0, 1);
    this.numberOfBytes = raw.slice(1, 2);

    // 0x1108: after movement (few sec)
    // 0x0000: stop
    // 0x0108: moving
    this.validFlag = raw.slice(2, 3);
    this.ref1 = new Ref(raw.slice(4, 8));
    this.ref2 = new Ref(raw.slice(8, 12));
    this.ref3 = new Ref(raw.slice(12, 16));
    this.ref4 = new Ref(raw.slice(16, 20));
    this.ref1Input = raw.slice(20, 22);
    this.ref2Input = raw.slice(22, 24);
    this.ref3Input = raw.slice(24, 26);
    this.ref4Input = raw.slice(26, 28);
    this.ref5 = new Ref(raw.slice(28, 32));
    this.diagnostic = raw.slice(32, 40);
    this.undefined1 = raw.slice(40, 42);
    this.button1 = raw.slice(42, 44);
    this.button2 = raw.slice(44, 46);
    this.ref6 = new Ref(raw.slice(46, 50));
    this.ref7 = new Ref(raw.slice(50, 54));
    this.ref8 = new Ref(raw.slice(54, 58));
    this.undefined2 = raw.slice(58, 64);
  }
}
