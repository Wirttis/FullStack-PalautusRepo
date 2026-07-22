const Course = ({course}) => {
  return (
    <div>
      <Header course={course} />
      <Content parts={course.parts} />
    </div>
  )
}

const Total = ({parts}) => {
  return (
    <div>
      <p><b>total of {parts.reduce((s, p) => s + p, 0)} exercises</b></p>   
    </div>
  )
}

const Content = ({parts}) => {
  return (
    <div>
      {parts.map(part => (
        <Part key={part.id} part={part} />
      ))}
      <Total parts = {parts.map(part => part.exercises)} />
    </div>
  )
}

const Header = ({course}) => {
  return (
    <div>
      <h2>{course.name}</h2>    
    </div>
  )
}
const Part = ({part}) => {
  return (
    <div>
      <ul style={{ listStyle: "none", padding: 0 }}>
        <li style={{ margin: '12px 0' }}>{part.name} {part.exercises}</li>
      </ul>
    </div>
  )
}

export default Course