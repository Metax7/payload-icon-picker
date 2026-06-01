import configPromise from '@payload-config'
import { getPayload } from 'payload'

export default async function page() {
  const payload = await getPayload({ config: configPromise })

  const { docs: posts } = await payload.find({ collection: 'posts' })
  const settings = await payload.findGlobal({ slug: 'site-settings' })

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '40px' }}>
      <h1>Payload Icon Picker - Demo Page</h1>

      {settings.favicon && (
        <section style={{ marginBottom: '40px' }}>
          <h2>Global Favicon (from Globals)</h2>
          <div
            dangerouslySetInnerHTML={{ __html: settings.favicon.svg }}
            style={{ height: '48px', width: '48px' }}
          />
        </section>
      )}

      <section>
        <h2>Posts & Blocks</h2>
        <div style={{ display: 'grid', gap: '20px' }}>
          {posts.map((post) => (
            <div
              key={post.id}
              style={{ border: '1px solid #eee', borderRadius: '8px', padding: '20px' }}
            >
              <h3>Post ID: {post.id}</h3>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <strong>Standalone Icon:</strong>
                {post.standaloneIcon && (
                  <div
                    dangerouslySetInnerHTML={{ __html: post.standaloneIcon.svg }}
                    style={{ width: '24px' }}
                  />
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <strong>Multi Icons (via Plugin):</strong>
                {post.postIcons?.map((icon) => (
                  <div
                    dangerouslySetInnerHTML={{ __html: icon.svg }}
                    key={icon.name}
                    style={{ width: '24px' }}
                  />
                ))}
              </div>

              {post.layout && post.layout.length > 0 && (
                <div>
                  <strong>Blocks:</strong>
                  {post.layout.map((block: any, i: number) => (
                    <div
                      key={i}
                      style={{
                        background: '#f9f9f9',
                        marginLeft: '20px',
                        marginTop: '10px',
                        padding: '10px',
                      }}
                    >
                      <span>Block Icon: </span>
                      {block.blockIcon && (
                        <div
                          dangerouslySetInnerHTML={{ __html: block.blockIcon.svg }}
                          style={{
                            display: 'inline-block',
                            verticalAlign: 'middle',
                            width: '20px',
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
