"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.random = void 0;
const random = (number) => {
    const str = "qwertyuiopasdfghjklzxcvbnm1234567890@&$";
    const n = str.length;
    let ans = "";
    for (let i = 0; i < number; i++) {
        ans += str[Math.floor(Math.random() * n)];
    }
    return ans;
};
exports.random = random;
