class LinksTransformer {
  constructor(links) {
    this.links = links
  }
  
  async element(element) {
    for (let link of this.links){
      let url = '<a href="' + link.url + '">'+ link.name +'</a>'
      element.append(url, {html: true})
    }
  
  }
}

async function gatherResponse(response) {
  const { headers } = response
  const contentType = headers.get("content-type") || ""
  if (contentType.includes("application/json")) {
    return JSON.stringify(await response.json())
  }
  else if (contentType.includes("application/text")) {
    return await response.text()
  }
  else if (contentType.includes("text/html")) {
    return await response.text()
  }
  else {
    return await response.text()
  }
}

async function handleRequest(request){ 
  const data = [{"name": "github", "url": "https://github.com/pzhao1799"}, 
  {"name": "facebook", "url": "https://www.facebook.com/peetah.zhao/"}, 
  {"name": "linkedin", "url": "https://www.linkedin.com/in/peter-zhao/"}]

  const json = JSON.stringify(data, null, 2)
  const url = "https://static-links-page.signalnerve.workers.dev"
  const init = {
    headers: {
      "content-type": "text/html;charset=UTF-8",
    },
  }
  if (request.url.includes("/links")) {
    return new Response(json, {
      headers:{
        "content-type": "application/json;charset=UTF-8"
      }
    })
  } else {
    const fetched_response = await fetch(url, init)
    const results = await gatherResponse(fetched_response)
    const response = new Response(results, init)
    const rewriter = new HTMLRewriter().on("div#links", new LinksTransformer(data))
    .on("div#profile", {element: e => e.removeAttribute("style")})
    .on("img#avatar", {element: e => e.setAttribute("src", "https://pzhao1799.github.io//profile.jpg")})
    .on("h1#name", {element: e => e.append("Peter Zhao")})
    .on("title", {element: e => e.setInnerContent("Peter Zhao")})
    .on("body", {element: e => e.setAttribute("class", "bg-indigo-700")})

    return rewriter.transform(response)
  }
}

addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request))
})