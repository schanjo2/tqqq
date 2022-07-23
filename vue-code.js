const app = new Vue({
    el: "#app",
    data() {
        return {};
    },
    mounted() {
        this.makeData();
        this.drawGraph();
    },
    methods: {
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
            trace.y.reverse();
            trace.x.reverse();
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
            return trace;
        },
        /**
         * 실전데이터 생성
         */
        makeData() {
            //console.log(Object.keys(qqq.Close))
            const firstDateTimestamp = 1265932800000;
            const timestampList = Object.keys(qqq.Close);
            //qqq.Close[temp1[2749]];
            const qqqClose = qqq.Close;
            const tqqqClose = tqqq.Close;
            const startDateIndex = 2749; //2010-02-12
            const firstTQQQCloseValue = 29.53;
            let lastTQQQValue = firstTQQQCloseValue;
            const customTQQQ = {};
            const diffSeries = {};
            this.buyQQQ = [];
            this.buyTQQQ = [];
            const buyPeriod = 22; //1달에 평일이 몇일인지 고려
            let buyCount = buyPeriod;
            for (let i = timestampList.length - 1; i > 2; i--) {
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
                // buy
                buyCount--;
                if (!buyCount) {
                    buyCount = buyPeriod;
                    this.buyTQQQ[yesterday] = lastTQQQValue;
                    this.buyQQQ[yesterday] = yesterdayValue;
                }
            }
            this.customTQQQ = customTQQQ;
            this.diffSeries = diffSeries;
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
        /**
         * 데이터 생성 알고리즘 검증을 위한 대조
         */
        makeData1() {
            //console.log(Object.keys(qqq.Close))
            const firstDateTimestamp = 1265932800000;
            const timestampList = Object.keys(qqq.Close);
            //qqq.Close[temp1[2749]];
            const qqqClose = qqq.Close;
            const tqqqClose = tqqq.Close;
            const startDateIndex = 2749; //2010-02-12
            const firstTQQQCloseValue = 0.43;
            let lastTQQQValue = firstTQQQCloseValue;
            const customTQQQ = {};
            const diffSeries = {};
            for (let i = startDateIndex + 1; i < timestampList.length; i++) {
                const now = timestampList[i];
                const yesterday = timestampList[i - 1];
                const nowValue = qqqClose[now];
                const yesterdayValue = qqqClose[yesterday];
                const diffValue = nowValue - yesterdayValue;
                const diffRatio = diffValue / yesterdayValue;
                lastTQQQValue *= 1 + diffRatio * 3;
                customTQQQ[now] = lastTQQQValue;
                diffSeries[now] =
                    ((customTQQQ[now] - tqqqClose[now]) / tqqqClose[now]) * 100;
            }
            this.customTQQQ = customTQQQ;
            this.diffSeries = diffSeries;
            console.log("result", lastTQQQValue);
            document.querySelector("#result").value = lastTQQQValue;
        },
        /**
         * 검증용 2 미래에서부터 역산
         */
        makeData2() {
            //console.log(Object.keys(qqq.Close))
            const firstDateTimestamp = 1265932800000;
            const timestampList = Object.keys(qqq.Close);
            //qqq.Close[temp1[2749]];
            const qqqClose = qqq.Close;
            const tqqqClose = tqqq.Close;
            const startDateIndex = 2749; //2010-02-12
            const firstTQQQCloseValue = 29.53;
            let lastTQQQValue = firstTQQQCloseValue;
            const customTQQQ = {};
            const diffSeries = {};
            for (
                let i = timestampList.length - 1;
                i > startDateIndex + 1;
                i--
            ) {
                const now = timestampList[i];
                const yesterday = timestampList[i - 1];
                const nowValue = qqqClose[now];
                const yesterdayValue = qqqClose[yesterday];
                const diffValue = nowValue - yesterdayValue;
                const diffRatio = diffValue / yesterdayValue;
                lastTQQQValue /= 1 + diffRatio * 3;
                customTQQQ[now] = lastTQQQValue;
                diffSeries[now] =
                    ((customTQQQ[now] - tqqqClose[now]) / tqqqClose[now]) * 100;
            }
            this.customTQQQ = customTQQQ;
            this.diffSeries = diffSeries;
            console.log("result", lastTQQQValue);
            document.querySelector("#result").value = lastTQQQValue;
        },
    },
});
