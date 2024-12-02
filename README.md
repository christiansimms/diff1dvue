# diff1dvue: ARC AI challenge but 1-D and using letters instead of colors

## Design

There are 3 phases:

- Phase 1: Match -- compare input and output strings.
- Phase 2: Generalize
- Phase 3: Apply rules

When program runs, it's just a bunch of Nodes which can make connections, search, and evaluate.

### Phase 1: Match

Each input pair comes in as two strings.
Each string is a ValueNode for each char, connected by a link of type "seq" to the next char.
A MatcherNode connects each input and output char (ValueNode).
Each MatcherNode has two children SearchNode's, one for each input and output char.
Each SearchNode has one child, the ValueNode it points to.
When a SearchNode runs (in method doStep), if its current child does not match the target, then it will try to move to
the next char in the sequence.
If it cannot find a match within a certain number of steps, it will stop searching.

MatcherNode will categorize its children's results into:
- 'stay' | 'move' | 'gone' | 'appear'
And create ObjectNode of this type, with its child being the MatcherNode.

### Phase 2: Generalize

Once all existing nodes are done, we create a GeneralizeNode.
This starts by looking at all ObjectNodes.
For each ObjectNode, it makes a RuleNode, which represents the change from input to output.
FUTURE: Right now it throws an exception if there is a conflict between 2 rules, but better to refine the rules.

### Phase 3: Apply rules

We create ApplyRulesNode, which takes the input and applies the rules to it.


## Build Setup

If you want to run and test this locally:

``` bash
# One-time: install dependencies
npm install

# Run locally:
npm run dev

# build for production with minification
npm run build
npm run preview  # if you want to test the build

# build for production and view the bundle analyzer report
npm run build --report

# run lint
npm run lint
```
