/**
 * 5년 나눠서 수익률 범위 확인하기
 * 1배에서 차츰 비율 변경하는 방식으로도 해보기
 */
const app = new Vue({
    el: "#app",
    data() {
        return {
            qqq: {
                earningsRate: 0,
            },
            tqqq: {
                earningsRate: 0,
            },
            accTraces: [],
        };
    },
    mounted() {
        this.makeStockData();
        this.makeBuyData();
        this.drawGraph();
        this.calEarningRates();
    },
    methods: {
        calEarningRates() {
            const qqqData = this.accTraces[0].y;
            this.qqq.earningsRate =
                (qqqData[qqqData.length - 1] / qqqData.length) * 100 - 100;
            const tqqqData = this.accTraces[1].y;
            this.tqqq.earningsRate =
                (tqqqData[tqqqData.length - 1] / tqqqData.length) * 100 - 100;
                console.log(tqqqData.length,tqqqData[tqqqData.length - 1]);
        },
        drawGraph() {
            const traceList = [];
            traceList.push(this.makeTrace(qqq.Close, "QQQ"));
            traceList.push(this.makeTrace(tqqq.Close, "TQQQ"));
            traceList.push(this.makeTrace(this.customTQQQ, "Custom TQQQ"));
            // traceList.push(this.makeTrace(this.diffSeries, "diff"));
            // 적립액
            traceList.push(
                this.changeToAcc(this.makeTrace(this.buyQQQ, "QQQ acc"))
            );
            traceList.push(
                this.changeToAcc(this.makeTrace(this.buyTQQQ, "TQQQ acc"))
            );
            /*  console.log(
                this.changeToAcc(this.makeTrace(this.buyQQQ, "QQQ acc"))
            );
            console.log(
                this.changeToAcc(this.makeTrace(this.buyTQQQ, "TQQQ acc"))
            ); */
            console.log(traceList);
            Plotly.newPlot(
                this.$refs.graph,
                traceList,
                {
                    margin: { t: 30 },
                    legend: {
                        xanchor: "right",
                        yanchor: "bottom",
                        x: 1,
                        y: 0,
                    },
                    yaxis: { type: "log", title: "value" },
                    yaxis2: {
                        overlaying: "y",
                        side: "right",
                        type: "log",
                        title: "balance",
                    },
                },
                { responsive: true }
            );
        },
        changeToAcc(trace) {
            const newY = [];
            for (let i in trace.y) {
                let sum = 0;
                for (j = 0; j <= i; j++) {
                    //구매단가 -> 구매 수량  = 1회 구매금액 / 구매단가
                    sum += 1 / trace.y[j];
                }
                newY.push(sum * trace.y[i]);
                //console.log(sum, trace.x[i]);
            }
            trace.y = newY;
            trace.type = "scatter";
            trace.mode = "markers";
            trace.yaxis = "y2";
            this.accTraces.push(trace);
            return trace;
        },
        /**
         * 실전데이터 생성
         */
        makeStockData() {
            const firstDateTimestamp = 1265932800000;
            const timestampList = Object.keys(qqq.Close);
            const qqqClose = qqq.Close;
            const tqqqClose = tqqq.Close;
            const startDateIndex = 2749; //2010-02-12
            const firstTQQQCloseValue = 29.53;
            let lastTQQQValue = firstTQQQCloseValue;
            const customTQQQ = {};
            const diffSeries = {};

            //적립 기간
            //default
            let accStart = 2;
            let accEnd = timestampList.length - 1;
            /* accStart = 800;
            accEnd = 1750; */
            for (let i = accEnd; i > accStart; i--) {
                const now = timestampList[i];
                const yesterday = timestampList[i - 1];
                const nowValue = qqqClose[now];
                const yesterdayValue = qqqClose[yesterday];
                const diffValue = nowValue - yesterdayValue;
                const diffRatio = diffValue / yesterdayValue;
                lastTQQQValue /= 1 + diffRatio * 3;
                customTQQQ[yesterday] = lastTQQQValue;
                diffSeries[yesterday] =
                    ((customTQQQ[now] - tqqqClose[now]) / tqqqClose[now]) * 100;
            }
            this.customTQQQ = customTQQQ;
            this.diffSeries = diffSeries;
        },
        makeBuyData() {
            this.buyQQQ = {};
            this.buyTQQQ = {};

            const dateList = Object.keys(qqq.Close);
            const buyPeriod = 22; //1달에 평일이 몇일인지 고려
            let buyPeriodCount = buyPeriod; //init count

            const startIndex = 3500;
            const endIndex = 4000; // max 5878

            for (let i = startIndex; i < endIndex; i++) {
                buyPeriodCount--;
                if (!buyPeriodCount) {
                    buyPeriodCount = buyPeriod;
                    const now = dateList[i];
                    const nowQQQValue = qqq.Close[now];
                    this.buyQQQ[now] = nowQQQValue;
                    const nowTQQQValue = this.customTQQQ[now];
                    this.buyTQQQ[now] = nowTQQQValue;
                }
            }
        },
        makeTrace(stockData, name = "test") {
            const trace = {
                x: [],
                y: [],
                name,
            };
            for (let key in stockData) {
                const value = stockData[key];
                trace.x.push(moment(key * 1).format("YYYY-MM-DD hh:mm:SS"));
                trace.y.push(value);
            }
            return trace;
        },
    },
});
