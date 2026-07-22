const Notification = ({ message, state }) => {
  if (message === null || message === "") {

    return null
  }
  if(state === 1) {
    return (
        <div className="error">
        {message}
        </div>
    )
    } else {
        return (
        <div className="success">
        {message}
        </div>
    )
    } 

}

export default Notification