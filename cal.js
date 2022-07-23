//console.log(Object.keys(qqq.Close))
const firstDateTimestamp = 1265932800000;
const timestampList = Object.keys(qqq.Close);
//qqq.Close[temp1[2749]];
qqqClose = qqq.Close;
const startDateIndex = 2749; //2010-02-12
const firstTQQQCloseValue = 0.43;
let lastTQQQValue = firstTQQQCloseValue;
const customTQQQ = {};
for(let i = startDateIndex + 1; i < timestampList.length; i++){
    const now = timestampList[i];
    const yesterday = timestampList[i - 1];
    const nowValue = qqqClose[now];
    const yesterdayValue = qqqClose[yesterday];
    const diffValue = nowValue - yesterdayValue;
    const diffRatio = diffValue / yesterdayValue;
    lastTQQQValue *= 1 + diffRatio * 3;
    customTQQQ[now] = lastTQQQValue;
}
console.log('result', lastTQQQValue);
document.querySelector('#result').value = lastTQQQValue;
