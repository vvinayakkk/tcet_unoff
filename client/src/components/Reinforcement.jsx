class ReinforcementLearningAgent {
    constructor() {
      this.qTable = JSON.parse(localStorage.getItem("qTable")) || {};
      this.learningRate = 0.1;
      this.discountFactor = 0.9;
      this.explorationRate = 0.1;
    }
  
    getAction(state) {
      if (Math.random() < this.explorationRate || !this.qTable[state]) {
        return this.getRandomAction();
      }
      return Object.keys(this.qTable[state]).reduce((a, b) => (this.qTable[state][a] > this.qTable[state][b] ? a : b));
    }
  
    getRandomAction() {
      return ["action1", "action2", "action3"][Math.floor(Math.random() * 3)];
    }
  
    updateQTable(state, action, reward, nextState) {
      if (!this.qTable[state]) this.qTable[state] = {};
      if (!this.qTable[state][action]) this.qTable[state][action] = 0;
      
      const maxFutureReward = this.qTable[nextState] ? Math.max(...Object.values(this.qTable[nextState])) : 0;
      this.qTable[state][action] = (1 - this.learningRate) * this.qTable[state][action] +
        this.learningRate * (reward + this.discountFactor * maxFutureReward);
      
      localStorage.setItem("qTable", JSON.stringify(this.qTable));
    }
  
    async fetchRandomData() {
      try {
          const response = await fetch('http://localhost:9000/api/corn-data');
          const data = await response.json();
          return data;
      } catch (error) {
          console.error('Error fetching corn data:', error);
          return null;
      }
    }

    calculateReward(data) {
      // Calculate reward based on actual metrics
      const responseTime = data.responseTime || 0;
      const errorRate = data.errorRate || 0;
      
      // Higher reward for lower response times and error rates
      return (1000 - responseTime) / 1000 - errorRate;
    }

    async trainNightly() {
      console.log("Training started with real data...");
      try {
          for (let i = 0; i < 100; i++) {
              const data = await this.fetchRandomData();
              if (!data) continue;

              const state = JSON.stringify({
                  endpoint: data.endpoint,
                  method: data.method,
                  timeOfDay: new Date().getHours()
              });

              const action = this.getAction(state);
              const reward = this.calculateReward(data);
              const nextState = JSON.stringify({
                  endpoint: data.endpoint,
                  method: data.method,
                  timeOfDay: (new Date().getHours() + 1) % 24
              });

              this.updateQTable(state, action, reward, nextState);
          }
          console.log("Training completed with real data.");
      } catch (error) {
          console.error("Training error:", error);
      }
    }
  
    getRandomState() {
      return ["state1", "state2", "state3"][Math.floor(Math.random() * 3)];
    }
  
    getReward(state, action) {
      return Math.random() > 0.5 ? 1 : -1;
    }
  
    getNextState(state, action) {
      return this.getRandomState();
    }
  }
  
  const agent = new ReinforcementLearningAgent();
  
  // Schedule nightly training (simulated cron job)
  setInterval(() => {
    const now = new Date();
    if (now.getHours() === 2) { // Runs at 2 AM
      agent.trainNightly();
    }
  }, 60 * 60 * 1000); // Check every hour
