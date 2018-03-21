import 'React' from 'react'

const TooMuchHtml = props => (
  <div>
    <h1>Foo</h1>
    <div>
      <h2>Bar <span>Noogles</span></h2>
    </div>
  </div>
)

const InlineConditionals = props => (
  <div>
    { props.heading && (
      <h1>{props.heading}</h1>
    )}
    { !props.heading && (
      <h1>No heading</h1>
    )}
  </div>
)

const UsesClassName = props => (
  <div className='container'>
    <h2 className='container__heading'>Heading</h2>
    <div className='container__thing'>
    </div>
  </div>
)

const Component = ({children, ...props}) => {
  return (
    <div>
      <TooMuchHtml />
      <InlineConditionals heading="hi there" />
      <InlineConditionals />
      <UsesClassName />
    </div>
  )
}

export {
  TooMuchHtml,
  InlineConditionals,
  Component,
  Component as default
}
