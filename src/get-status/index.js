module.exports.handler = async (event) => {
  console.log('Logging event:');
  console.log(event);
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
        message: 'Status OK.'
    }),
  };
}