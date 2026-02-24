export default function Challenge1() {
  return (
    <html>
      <head>
        <style>{`
          body { background-color: #f0f0f0; }
          .content { color: #333; font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; }
          .card {
            background: #fff;
            border: 1px solid #e6e6e6;
            border-radius: 14px;
            padding: 18px;
            max-width: 820px;
            box-shadow: 0 6px 18px rgba(0,0,0,.06);
            margin-top: 14px;
          }
          /* FLAG{web_inspect_pro} */
        `}</style>
      </head>
      <body>
        <div className="content">
          <h1>Hidden in Plain Sight</h1>
          <div className="card">
            <p>Find the hidden flag.</p>
          </div>
        </div>
      </body>
    </html>
  )
}
