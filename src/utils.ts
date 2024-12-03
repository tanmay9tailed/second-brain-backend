export const random = (number: number) => {
    const str = "qwertyuiopasdfghjklzxcvbnm1234567890@&$"
    const n = str.length
    let ans = ""
    for(let i = 0;i<number;i++){
        ans += str[Math.floor(Math.random()*n)]
    }
    return ans;
}