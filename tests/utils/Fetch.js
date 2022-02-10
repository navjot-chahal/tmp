const fetch = require("node-fetch");

class Fetch {
  async parseData(res) {
    const data = await res.json();

    //might need to change for flexibility
    if (!res.ok) {
      throw data;
    }

    return data;
  }

  async get(url, headers, queries) {
    const queryString = Object.entries(queries)
      .reduce((acc, [key, value]) => {
        acc.append(key, value);
        return acc;
      }, new URLSearchParams())
      .toString();

    const res = await fetch(`${url}?${queryString}`, {
      headers,
      method: "GET",
    });
    return this.parseData(res);
  }

  async post(
    url,
    body,
    headers
  ) {
    const res = await fetch(url, {
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json", ...headers },
      method: "POST",
    });

    return this.parseData(res);
  }

  async delete(url, headers) {
    const res = await fetch(url, { headers, method: "DELETE" });

    if (!res.ok) {
      const data = await res.json();
      throw data;
    }
  }
}

module.exports = Fetch;
