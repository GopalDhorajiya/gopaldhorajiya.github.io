
class PriorityQueue {
  constructor() {
    this.heap = [];
  }

  enqueue(value) {
    this.heap.push(value);
    let i = this.heap.length - 1;
    while (i > 0) {
      let j = Math.floor((i - 1) / 2);
      if (this.heap[i][0] >= this.heap[j][0]) {
        break;
      }
      [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
      i = j;
    }
  }

  dequeue() {
    if (this.heap.length === 0) {
      throw new Error("Queue is empty");
    }
    let i = this.heap.length - 1;
    const result = this.heap[0];
    this.heap[0] = this.heap[i];
    this.heap.pop();

    i--;
    let j = 0;
    while (true) {
      const left = j * 2 + 1;
      if (left > i) {
        break;
      }
      const right = left + 1;
      let k = left;
      if (right <= i && this.heap[right][0] < this.heap[left][0]) {
        k = right;
      }
      if (this.heap[j][0] <= this.heap[k][0]) {
        break;
      }
      [this.heap[j], this.heap[k]] = [this.heap[k], this.heap[j]];
      j = k;
    }

    return result;
  }

  get count() {
    return this.heap.length;
  }
}

let graph = new Map();
let possition = {};
let nodesG = [];
let selectedRadiofordirection;
let selectedRadioforweight;

function updategraph() {
  const nodeIn = document.getElementById("nodes").value.trim();
  const edgesIn = document.getElementById("edges").value.trim();
  const svg = document.getElementById("graph");
  const errordisplay = document.getElementById("error");
  selectedRadiofordirection = document.querySelector(
    'input[name="direction"]:checked'
  );
  selectedRadioforweight = document.querySelector(
    'input[name="weightedtype"]:checked'
  );
  svg.innerHTML = "";
  const nodes = nodeIn.split(",").map((n) => n.trim());
  nodesG = nodes;
  const edges = edgesIn.split(/\r?\n/).map((line) => line.trim().split(/\s+/));
  graph = new Map();
  possition = {};

  const centerX = 350,
    centerY = 250,
    radius = 200;
  nodes.forEach((node, i) => {
    const angle = ((2 * Math.PI) / nodes.length) * i;

    let nodex = centerX + radius * Math.cos(angle);
    let nodey = centerY + radius * Math.sin(angle);

    possition[node] = { nodex, nodey };
    graph.set(node, new Map());
    // graph[node] = [];
  });

  // edges.forEach((edge,i) =>
  let i = 0;
  for (const edge of edges) {
    if (!graph.has(edge[0])) {
      errordisplay.textContent = `Invalid input on line ${i + 1}: "${edge}"`;
      return;
    }
    if (selectedRadioforweight.value == "weighted") {
      if (edge.length == 3) {
        let num = parseInt(edge[2]);
        if (isNaN(num)) {
          errordisplay.textContent = `Invalid input on line ${i + 1
            }: "${edge}"`;
          return;
        }
        graph.get(edge[0]).set(edge[1], num);
        if (selectedRadiofordirection.value == "undirected") {
          if (!graph.has(edge[1])) {
            errordisplay.textContent = `Invalid input on line ${i + 1}: "${edge}"`;
          }
          graph.get(edge[1]).set(edge[0], num);
        }
      } else {
        errordisplay.textContent = `Invalid input on line ${i + 1}: "${edge}"`;
        return;
      }
    } else {
      if (edge.length <= 1) {
        errordisplay.textContent = `Invalid input on line ${i + 1}: "${edge}"`;
        return;
      } else {
        graph.get(edge[0]).set(edge[1], 1);
        if (selectedRadiofordirection.value == "undirected") {
          if (!graph.has(edge[1])) {
            errordisplay.textContent = `Invalid input on line ${i + 1}: "${edge}"`;
            return;
          }
          graph.get(edge[1]).set(edge[0], 1);
        }
      }
    }
    i++;
  }
  errordisplay.textContent = '';
  // console.log(graph);
  makeSvg(edges, nodes);
  document.getElementById("result").textContent =
    "Traversal results will appear here...";
  
}
function resetGraph() {
  nodesG.forEach((node) => {
    document.getElementById(node).style.fill = "black";
  });
  document.getElementById("result").textContent =
    "Traversal results will appear here...";
}
function runDfs() {
  // resetGraph();
  const startNode = document.getElementById("startNode").value;
  let visited = {};
  console.log(graph);
  let delay = 0;
  const dfsOrder = [];
  function dfs(node) {
    dfsOrder.push(node);
    setTimeout(mark, delay);
    function mark() {
      if (nodesG.includes(node)) {
        console.log("Visited :-", node);
        document.getElementById(node).style.fill = "green";
      }
    }
    delay = delay + 1000;
    visited[node] = true;
    for (const [key, value] of graph.get(node)) {
      if (visited[key]) continue;
      dfs(key);
    }
  }
  dfs(startNode);
  setTimeout(() => {
    document.getElementById("result").textContent =
      "DFS Order : " + dfsOrder.join(" → ");
  }, delay);
}
function runBfs() {
  // resetGraph();
  const startNode = document.getElementById("startNode").value;
  const queue = [];
  queue.push(startNode);
  const visited = [];
  visited.push(startNode);
  const bfsOrder = [];
  let delay = 0;
  while (queue.length) {
    let node = queue.shift();
    bfsOrder.push(node);
    setTimeout(mark, delay);
    function mark() {
      if (nodesG.includes(node)) {
        console.log("Visited :-", node);
        document.getElementById(node).style.fill = "green";
      }
    }
    delay += 1000;
    for (let [key, value] of graph.get(node)) {
      if (visited.includes(key)) {
        continue;
      }
      queue.push(key);
      visited.push(key);
    }
  }
  setTimeout(() => {
    document.getElementById("result").textContent =
      "BFS Order : " + bfsOrder.join(" → ");
  }, delay);
}

function dijkstraAlgo() {
  let dist = {};
  let startNode = document.getElementById("startNode").value;
  for (let node of nodesG) {
    dist[node] = Number.MAX_VALUE;
  }
  // console.log(dist);

  dist[startNode] = 0;

  let pq = new PriorityQueue();

  let edges = [];
  let visited = [];
  let parent = {};
  pq.enqueue([0, startNode]);
  while (pq.count) {
    const p = pq.dequeue();
    const wt = p[0];
    const u = p[1];
    // res += wt;
    // edges.push([u,p[2]]);
    for (let [key, value] of graph.get(u)) {
      if (dist[key] > value + dist[u]) {
        dist[key] = value + dist[u];
        pq.enqueue([dist[key], key]);
        parent[key] = u;
      }
    }
  }
  let arr = [];
  let road = [];
  for (let n of nodesG) {
    let node = n;
    road = [];
    while(node != startNode)
      {
        console.log(node);
        road.push(node);
        console.log(road);
        node = parent[node];
      }
      road.push(startNode);
      // console.log(n);
      arr.push(road);
      // document.getElementById('result').textContent += "\n" + road.join(" → ");
      if (n == startNode) {
        continue;
      }
      edges.push([parent[n], n]);
  }
  console.log(arr);
  document.getElementById('result').textContent = "";
  arr.forEach(a =>{
    document.getElementById('result').innerHTML += a[0] +' : ';
    a = a.reverse();
    document.getElementById('result').innerHTML += a.join(" → ") + '<br>';
  })
  // console.log(edges);

  makeSvg(edges, nodesG, true);
}

function primsAlgo() {
  // console.log(graph);
  // const svg = document.getElementById("graph");
  let pq = new PriorityQueue();
  let visited = [];
  let edge = [];
  const startNode = document.getElementById("startNode").value;
  pq.enqueue([0, startNode, null]);
  let res = 0;
  while (pq.count) {
    const p = pq.dequeue();

    const wt = p[0];
    const u = p[1];
    // console.log(u);

    if (visited[u]) {
      continue;
    }
    res += wt;
    visited[u] = true;
    edge.push([p[2], u]);
    // console.log(graph.get(u));
    for (let [key, value] of graph.get(u)) {
      if (!visited[key]) {
        pq.enqueue([value, key, u]);
      }
    }
  }
  console.log(edge);
  edge.shift();
  makeSvg(edge, nodesG, true);
  document.getElementById("result").textContent = "Total Weight = " + res;
  console.log(res);
}
function iscyclefordirected(node, visited, instack) {
  if (instack[node] == true) {
    return true;
  }
  if (visited[node] == true) {
    return false;
  }
  visited[node] = true;
  instack[node] = true;

  for (let [key, value] of graph.get(node)) {
    console.log(key);
    if (iscyclefordirected(key, visited, instack) == true) {
      return true;
    }
  }
  instack[node] = false;
  return false;
}
function checkcycle() {
  let instack = [];
  let visited = [];
  if(selectedRadiofordirection.value == 'directed')
  {
  for (let n of nodesG) {
    if (!visited[n] && iscyclefordirected(n, visited, instack)) {
      document.getElementById("result").textContent = "Cycle status :- present";
      return;
    }
  }
  document.getElementById("result").textContent = "Cycle status :- Not present";
  }
  else
  {
    for (let n of nodesG) {
    if (!visited[n] && iscycleforindirected(n, visited, null)) {
      document.getElementById("result").textContent = "Cycle status :- present";
      return;
    }
  }
  document.getElementById("result").textContent = "Cycle status :- Not present";
  }
}


function iscycleforindirected(node,visited,parent)
{
  visited[node] = true;
  for(let [key,value] of graph.get(node))
  {
    if(visited[key] == null)
    {
      if(iscycleforindirected(key,visited,node))
      {
        return true;
      }
    }
    else if(parent !== key)
    {
      return true;
    }
  }
  return false;
}

function checktopoSort() {
  let instack = [];
  let visited = [];
  if(selectedRadiofordirection.value != 'directed')
  {
    document.getElementById("result").textContent =
        "Cycle detect Toposort not possible";
      return;
  }
  for (let n of nodesG) {
    if (!visited[n] && iscyclefordirected(n, visited, instack)) {
      document.getElementById("result").textContent =
        "Cycle detect Toposort not possible";
      return;
    }
  }
  let order = [];
  visited = [];
  let delay = 0;
  function dfs(node) {
    visited[node] = true;
    for (let [key, value] of graph.get(node)) {
      if (visited[key]) {
        continue;
      }
      dfs(key);
    }
    order.push(node);
  }
  for (let n of nodesG) {
    if (!visited[n]) {
      dfs(n);
    }
  }
  order.reverse();
  order.forEach((node) => {
    setTimeout(mark, delay);
    function mark() {
      if (nodesG.includes(node)) {
        console.log("Visited :-", node);
        console.log(document.getElementById(node).getAttribute("style.fill"));
        document.getElementById(node).style.fill = "green";
      }
    }
    delay = delay + 1000;
  });
  setTimeout(() => {
    document.getElementById("result").textContent =
      "Toposort Order : " + order.join(" → ");
  }, delay - 1000);
}

function makeSvg(edges, nodes, bool = false) {
  const svg = document.getElementById("graph");
  svg.innerHTML = "";
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  const marker = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "marker"
  );
  marker.setAttribute("id", "arrow");
  marker.setAttribute("markerWidth", "10");
  marker.setAttribute("markerHeight", "10");
  marker.setAttribute("refX", "10");
  marker.setAttribute("refY", "3");
  marker.setAttribute("orient", "auto");
  marker.setAttribute("markerUnits", "strokeWidth");

  const arrowPath = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  arrowPath.setAttribute("d", "M0,0 L0,6 L9,3 z");
  arrowPath.setAttribute("fill", "grey");
  marker.appendChild(arrowPath);

  defs.appendChild(marker);
  svg.appendChild(defs);

  edges.forEach(([from, to]) => {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    const dx = possition[to].nodex - possition[from].nodex;
    const dy = possition[to].nodey - possition[from].nodey;
    const length = Math.sqrt(dx * dx + dy * dy);
    const offset = 20;
    const ratio = (length - offset) / length;

    const x2 = possition[from].nodex + dx * ratio;
    const y2 = possition[from].nodey + dy * ratio;

    line.setAttribute("x1", possition[from].nodex);
    line.setAttribute("y1", possition[from].nodey);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("stroke", "grey");
    line.setAttribute("stroke-width", "2");
    if (bool || selectedRadiofordirection.value == "directed") {
      line.setAttribute("marker-end", "url(#arrow)");
    }
    svg.appendChild(line);

    if (selectedRadioforweight.value == "weighted") {
      let x = (possition[from].nodex + possition[to].nodex) / 2;
      let y = (possition[from].nodey + possition[to].nodey) / 2;
      let weight = graph.get(from).get(to);
      // console.log(weight);
      const text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      text.setAttribute("class", "weight");
      text.setAttribute("x", x);
      text.setAttribute("y", y);
      text.textContent = weight;
      svg.appendChild(text);
    }
  });

  nodes.forEach((node) => {
    let circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    circle.setAttribute("id", node);
    circle.setAttribute("cx", possition[node].nodex);
    circle.setAttribute("cy", possition[node].nodey);
    circle.setAttribute("r", 20);
    circle.style.fill = "black";
    svg.appendChild(circle);
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", possition[node].nodex);
    text.setAttribute("y", possition[node].nodey + 5);
    text.textContent = node;
    svg.appendChild(text);
  });
  // console.log(svg);
}

function SCC()
{
  let dfso = [];
  let tempgraph = new Map();
  let visited = {};
  function dfs(node,graph)
  {
    visited[node] = true;
    for(let [key,value] of graph.get(node))
      {
        if(visited[key])
          {
            continue;
          }
          dfs(key,graph);
        }
      dfso.push(node);
  }
  for(let n of nodesG)
  {
    tempgraph.set(n,new Map());
    if(visited[n])
    {
      continue;
    }
    dfs(n,graph);
  }
  console.log(dfso);
  for(let n of nodesG)
  {
    for(let [key,value] of graph.get(n))
    {
      tempgraph.get(key).set(n,value);
    }
  }
  console.log(tempgraph);
  visited = {};
  let temp = dfso;
  dfso = [];
  let arr = [];
  for(let i = temp.length - 1 ; i >= 0 ; i--)
  {
    console.log(temp[i]);
    if(!visited[temp[i]])
    {
      dfs(temp[i],tempgraph);
      arr.push(dfso);
      // console.log(dfso);
      dfso = [];
    }
  }
  console.log(arr);
  document.getElementById('result').textContent = "";
  document.getElementById('result').innerHTML += "Total Scc is :"+ arr.length + '<br>';
  arr.forEach(a =>{
    // document.getElementById('result').innerHTML += a[0] +' : ';
    // a = a.reverse();
    document.getElementById('result').innerHTML += a.join(" , ") + '<br>';
  })

}