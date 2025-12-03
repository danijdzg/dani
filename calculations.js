// calculations.js
export const calculateStandardDeviation = (returns) => {
    if (!returns || returns.length < 2) return 0;
    
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const squaredDifferences = returns.map(r => Math.pow(r - mean, 2));
    const variance = squaredDifferences.reduce((sum, sq) => sum + sq, 0) / (returns.length - 1);
    
    return Math.sqrt(variance);
};

export const calculateAnnualVolatility = (monthlyReturns) => {
    const stdDev = calculateStandardDeviation(monthlyReturns);
    return stdDev * Math.sqrt(12); // Anualizar volatilidad
};

export const calculateMaxDrawdown = (values) => {
    if (!values || values.length < 2) return 0;
    
    let peak = values[0];
    let maxDrawdown = 0;
    
    for (let i = 1; i < values.length; i++) {
        if (values[i] > peak) {
            peak = values[i];
        } else {
            const drawdown = (peak - values[i]) / peak;
            if (drawdown > maxDrawdown) {
                maxDrawdown = drawdown;
            }
        }
    }
    
    return maxDrawdown;
};
export const calculateSortinoRatio = (returns, riskFreeRate = 0.02) => {
    if (!returns || returns.length < 2) return 0;
    
    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const negativeReturns = returns.filter(r => r < 0);
    const downsideStdDev = calculateStandardDeviation(negativeReturns);
    
    if (downsideStdDev === 0) return 0;
    
    return (meanReturn - riskFreeRate) / downsideStdDev;
};
export const calculateSharpeRatio = (returns, riskFreeRate = 0.02) => {
    if (!returns || returns.length < 2) return 0;
    
    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const stdDev = calculateStandardDeviation(returns);
    
    if (stdDev === 0) return 0;
    
    return (meanReturn - riskFreeRate) / stdDev;
};

export const calculateBeta = (portfolioReturns, marketReturns) => {
    if (!portfolioReturns || !marketReturns || portfolioReturns.length !== marketReturns.length) return 1;
    
    const portfolioMean = portfolioReturns.reduce((sum, r) => sum + r, 0) / portfolioReturns.length;
    const marketMean = marketReturns.reduce((sum, r) => sum + r, 0) / marketReturns.length;
    
    let covariance = 0;
    let marketVariance = 0;
    
    for (let i = 0; i < portfolioReturns.length; i++) {
        covariance += (portfolioReturns[i] - portfolioMean) * (marketReturns[i] - marketMean);
        marketVariance += Math.pow(marketReturns[i] - marketMean, 2);
    }
    
    return covariance / marketVariance;
};