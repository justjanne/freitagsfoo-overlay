import React, {useEffect, useState} from 'react';
import {useBroadcastChannel} from "../useBroadcastChannel";
import {DisplayState} from "../state/displayState";
import './Source.scss';

export default function Source() {
  const channel = useBroadcastChannel();
  const [state, setState] = useState<DisplayState | null>(null);
  useEffect(() => {
    const listener = (event: { data: DisplayState | null }) => setState(event.data);
    channel?.addEventListener("message", listener);
    return () => channel?.removeEventListener("message", listener);
  }, [channel]);

  if (state?.kind === "intro") {
    return (
      <div className="view intro">
        <header>
          <code>{"10 FOO\n20 GOTO 10"}</code>
        </header>
        <footer>
          <h1>{state.event.title}</h1>
          <aside>
            <h2 className="date">{state.event.date}</h2>
            <h2 className="hosts">{state.event.hosts.join(", ")}</h2>
          </aside>
        </footer>
      </div>
    );
  }

  if (state?.kind === "list") {
    return (
      <div className="view list">
        <header>
          <h1>Talks</h1>
        </header>
        <ul>
          {state.talks.map(talk => (
            <li>
              <h1 className="title">{talk.title}</h1>
              <p className="presenter">{talk.presenters.join(", ")}</p>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (state?.kind === "talk") {
    return (
      <div className="view talk">
        <header>
          <h1>Next Talk</h1>
        </header>
        <div className="talk">
          <h1 className="title">{state.talk.title}</h1>
          <p className="presenter">{state.talk.presenters.join(", ")}</p>
          <div className="content" dangerouslySetInnerHTML={{__html: state.talk.content}}/>
        </div>
      </div>
    );
  }

  return null;
}
