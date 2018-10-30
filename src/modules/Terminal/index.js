import React, { PureComponent, Fragment } from 'react';
import Prism from 'prismjs';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import TextArea from 'components/TextArea';

import './Terminal.scss';

class Terminal extends PureComponent {
  state = {
    terminalContent: ``,
    initialTerminalPrefix: '@forty-two:~$ ',
    terminalPrefix: '@forty-two:~$ ',
    commitMessage: 'made changes',
    outputContent: '',
    didAdd: false,
    didCommit: false,
    currentTab: 0,
  };

  componentDidMount() {
    this.setTerminalPrefix();
    Prism.highlightAll();
  }

  componentDidUpdate() {
    Prism.highlightAll();
  }

  setTerminalPrefix = () => {
    const { playerName } = this.props;
    const terminalPrefix = `${playerName}@fortytwo:~$ `;
    this.setState({ initialTerminalPrefix: terminalPrefix, terminalPrefix });
  };

  handleUpdateTerminalContent = terminalContent => {
    this.setState({ terminalContent });
  };

  confirmSuccessfulPush = command => {
    const { didAdd, didCommit } = this.state;
    if (command.includes('git add -A')) {
      this.setState({ didAdd: true });
    }
    if (command.includes('git add .')) {
      this.setState({ didAdd: true });
    }

    if (command.includes('git commit -m "') && didAdd) {
      const index = '"';
      const commitMessage = command.substring(
        command.indexOf(index) + 1,
        command.lastIndexOf(index),
      );
      this.setState({ didCommit: true, commitMessage });
    }
    if (command.includes("git commit -m '") && didAdd) {
      const index = "'";
      const commitMessage = command.substring(
        command.indexOf(index) + 1,
        command.lastIndexOf(index),
      );
      this.setState({ didCommit: true, commitMessage });
    }
    if (command.includes('git push') && didCommit) {
      const { onRunCode } = this.props;
      const outputContent = `Results: ${JSON.stringify(onRunCode())}`;
      this.setState({ outputContent, didCommit: false, didAdd: false, currentTab: 2 });
    }
  };

  handleKeyDown = event => {
    const { terminalPrefix } = this.state;
    if (event.keyCode === 9) {
      event.preventDefault();
      console.log(event.target.value);
      if (event.target.value === terminalPrefix) {
        const { didAdd, didCommit, commitMessage } = this.state;
        const terminalContent = didCommit
          ? 'git push'
          : didAdd
            ? `git commit -m "${commitMessage}"`
            : 'git add -A';
        this.setState({ terminalContent });
      }
    }
    if (event.keyCode === 13) {
      const { initialTerminalPrefix } = this.state;
      event.preventDefault();
      this.setState({
        terminalPrefix: `${event.target.value}\n${initialTerminalPrefix}`,
        terminalContent: '',
      });
      this.confirmSuccessfulPush(event.target.value.substring(terminalPrefix.length));
    }
  };

  handleNavigateTabs = (event, nextTab) => {
    this.setState({ currentTab: nextTab });
  };

  render() {
    const { terminalContent, terminalPrefix, outputContent, currentTab } = this.state;
    const { objectiveContent, isAnswerValid, disabled } = this.props;
    const rows = terminalContent.split(/\r|\r\n|\n/).length;

    return (
      <pre className="terminal">
        {currentTab === 0 && (
          <Fragment>
            <TextArea
              rows={rows + 80}
              value={terminalPrefix + terminalContent}
              onKeyDown={this.handleKeyDown}
              onChange={event =>
                this.handleUpdateTerminalContent(
                  event.target.value.substring(terminalPrefix.length),
                )
              }
              disabled={disabled}
            />
            <code className="language-bash">{terminalPrefix + terminalContent}</code>
          </Fragment>
        )}
        {currentTab === 1 && <div>{objectiveContent}</div>}
        {currentTab === 2 && (
          <div>
            {`> `}
            <span className={isAnswerValid ? 'valid-answer' : 'invalid-answer'}>
              {outputContent}
            </span>
          </div>
        )}
        <Tabs className="tabs" value={currentTab} onChange={this.handleNavigateTabs}>
          <Tab disableRipple label="Terminal" />
          <Tab disableRipple label="Objective" />
          <Tab disableRipple label="Output" />
        </Tabs>
      </pre>
    );
  }
}

export default Terminal;
