git config alias.mono '!f() { git --git-dir=$(git rev-parse --show-toplevel)/.git --work-tree=$(git rev-parse --show-toplevel) "$@"; }; f'
echo "✔ Git alias 'git mono' added for this repo"