import Link from 'next/link'
import { ExamplesType, resolveAllExamples } from '../utils/resolve-all-examples'

export default async function Page() {
  let examples = await resolveAllExamples('page-examples')

  if (examples === false) {
    return <p>No examples found.</p>
  }

  return (
    <div className="container mx-auto my-24">
      <div className="prose">
        <h2>Examples</h2>
        <Examples examples={examples} />
      </div>
    </div>
  )
}

function Examples(props: { examples: ExamplesType[] }) {
  return (
    <ul>
      {props.examples.map((example) => (
        <li key={example.path}>
          {example.children ? (
            <h3 className="text-xl capitalize">{example.name}</h3>
          ) : (
            <Link href={example.path} className="capitalize">
              {example.name}
            </Link>
          )}
          {example.children && <Examples examples={example.children} />}
        </li>
      ))}
    </ul>
  )
}
