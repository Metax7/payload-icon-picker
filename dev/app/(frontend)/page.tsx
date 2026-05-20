import configPromise from '@payload-config'
import { getPayload } from 'payload'

export default async function page() {
  const payload = await getPayload({ config: configPromise })

  const { docs: posts } = await payload.find({ collection: 'posts' })

  return (
    <div>
      <h1>Posts icons</h1>

      <ul>
        {posts.map((post) => (
          <li
            key={post.id}
            style={{
              listStyle: 'none',
            }}
          >
            {post.icon && <div dangerouslySetInnerHTML={{ __html: post.icon.svg }} />}
          </li>
        ))}
      </ul>
    </div>
  )
}
