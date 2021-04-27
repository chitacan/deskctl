import usb from "usb";
import { Status, Ref } from "./status.js";

const VENDOR = 0x12d3; // LINAK
const PRODUCT = 0x0002;

const REQUEST_TYPE_GET_CLASS_INTERFACE = 0xa1;
const REQUEST_TYPE_SET_CLASS_INTERFACE = 0x21;
const REQUEST_GET = 0x01;
const REQUEST_SET = 0x09;
const VALUE_GET_STATUS = 0x0304;
const VALUE_MOVE = 0x0305;
const STATUS_REPORT_SIZE = 64;

const REPORT_MOVE = 0x05;

const device = usb.findByIds(VENDOR, PRODUCT);
device.open();

export const getBuffer = ({ value, type }) => {
  const buffer = Buffer.alloc(2);
  if (type === "%") {
    buffer.writeInt16LE(Math.floor((Ref.MAX_POS * value) / 100));
  } else if (type === "cm") {
    buffer.writeInt16LE(Math.floor(value * 98));
  } else {
    buffer.writeInt16LE(value);
  }
  return buffer;
};

export const getStatus = () => {
  return new Promise((resolve, reject) => {
    device.controlTransfer(
      REQUEST_TYPE_GET_CLASS_INTERFACE,
      REQUEST_GET,
      VALUE_GET_STATUS,
      0,
      STATUS_REPORT_SIZE,
      (error, data) => {
        if (error) {
          reject(error);
        } else {
          resolve(new Status(data));
        }
      }
    );
  });
};

const move = (targetBuffer) => {
  return new Promise((resolve, reject) => {
    const data = Buffer.concat([Buffer.from([REPORT_MOVE]), targetBuffer]);
    device.controlTransfer(
      REQUEST_TYPE_SET_CLASS_INTERFACE,
      REQUEST_SET,
      VALUE_MOVE,
      0,
      data,
      (error, data) => {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      }
    );
  });
};

export const moveTo = async ({ value, type }, timeout = 60 * 1000) => {
  const started = Date.now();
  while (true) {
    const status = await getStatus();
    if (value === status.ref1.getPos(type)) {
      return Promise.resolve();
    }
    if (Date.now() >= started + timeout) {
      return Promise.reject(new Error('timeout'));
    }
    await move(getBuffer({ value, type }));
  }
};
