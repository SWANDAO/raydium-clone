import Big from 'big.js'

export const toFormat = (big: Big, dp?: number, isExponential?: boolean, ts = ',', ds = '.') => { // ES6 defaults
  if (big.gt(Big(0)) && dp !== undefined && dp > 0 && big.lt(Big(`1e-${dp}`))) {
    return `< ${Big(`1e-${dp}`).toFixed()}`
  }
  const temp = (!isExponential || Big(1e21).gt(big)) ? big.toFixed(dp, 0) : big.toExponential(dp, 0)
  const arr = temp.replace(/\.0+(?=$|e)/, '').split('.')
  if (arr[1]) {
    arr[1] = arr[1].replace(/0+($|e)/, '')
  }
  arr[0] = arr[0].replace(/\B(?=(\d{3})+(?!\d))/g, ts)
  return arr.join(ds)
}

export const toFormatString = (big: Big, dp?: number, isExponential?: boolean, ts = ',', ds = '.') => { // ES6 defaults
  const temp = (!isExponential || Big(1e21).gt(big)) ? big.toFixed(dp, 0) : big.toExponential(dp, 0)
  const arr = temp.replace(/\.0+(?=$|e)/, '').split('.')
  if (arr[1]) {
    arr[1] = arr[1].replace(/0+($|e)/, '')
  }
  arr[0] = arr[0].replace(/\B(?=(\d{3})+(?!\d))/g, ts)
  return arr.join(ds)
}
