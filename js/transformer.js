
const transformer = (dataArr) => {

  const resultArr = dataArr.map(data => {

    return {
      openTime: data[0],
      open: +data[1],
      max: +data[2],
      min: +data[3],
      close: +data[4],
      volume: +data[5],
    }
  })
  return resultArr
}

