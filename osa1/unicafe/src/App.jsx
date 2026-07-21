import { useState } from 'react'

const App = () => {
  const [good, setGood] = useState(0)
  const [neutral, setNeutral] = useState(0)
  const [bad, setBad] = useState(0)

  const onGood = () => setGood(good + 1)
  const onNeutral = () => setNeutral(neutral + 1)
  const onBad = () => setBad(bad + 1)

  
  return (
    <div>
      <h1>give feedback</h1>
      <div>
        <Button onClick = {onGood} text='good'/>
        <Button onClick = {onNeutral} text='neutral'/>
        <Button onClick = {onBad} text='bad'/>
      </div>
      <h1>statistics</h1>
      <Statistics bad = {bad} neutral = {neutral} good = {good} />
      
    </div>
  )
}

const Button = ({onClick, text}) => <button onClick={onClick}>{text}</button>

const Statistics = (props) => {
  const all = props.good + props.neutral + props.bad
  const average = (props.good + -props.bad) / all
  const positive = (props.good / all) * 100 + "%"
  if (props.good + props.neutral + props.bad == 0) {
    return (
      <div>
        No feedback given
      </div>
    )
  }
  return (
    <div>
      <table>
         <tbody>
            <StatisticLine text = "good" value = {props.good} />
            <StatisticLine text = "neutral" value = {props.neutral} />
            <StatisticLine text = "bad" value = {props.bad} />
            <StatisticLine text = "all" value = {all} />
            <StatisticLine text = "average" value = {average} />
            <StatisticLine text = "positive" value = {positive} />
        </tbody>
      </table>
    </div>
  )
}

const StatisticLine  = (props) => {
  return (
      <tr><td>{props.text}</td>
      <td>{props.value}</td></tr>
  )
}

export default App