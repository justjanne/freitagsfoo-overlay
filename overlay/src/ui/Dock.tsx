import React, {useEffect, useState} from 'react';
import {Metadata} from "../api/metadata";
import {DisplayState} from "../state/displayState";
import {useBroadcastChannel} from "../useBroadcastChannel";
import './Dock.scss';

export default function Dock() {
  const [id, setId] = useState<string>("");
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [status, setStatus] = useState<"loading" | "idle" | "error">("idle");

  const [state, setState] = useState<DisplayState | null>(null);
  const channel = useBroadcastChannel();
  useEffect(() => channel?.postMessage(state), [state, channel]);

  useEffect(() => {
    let timeout = setTimeout(
      async () => {
        setStatus("loading");
        fetch("http://localhost:8080/freitagsfoo/" + id)
          .then(it => it.json())
          .then(it => {
            setStatus("idle");
            setMetadata(it);
            setState(state => state ?? {kind: "intro", event: it.event})
          })
          .catch(err => {
            console.error(err);
            setStatus("error");
          });
      },
      300
    );
    return () => {
      clearTimeout(timeout);
      // @ts-ignore
      timeout = 0;
    }
  }, [id]);

  return (
    <div className="dock">
      <p>
        <input type="text" value={id} onChange={({target: {value}}) => setId(value)}/>
        <span className="status">{status}</span>
      </p>
      <ul>
        {metadata && (
          <>
            <li onClick={() => setState({kind: "intro", event: metadata.event})}>
              Intro
            </li>
            <li onClick={() => setState({kind: "list", event: metadata.event, talks: metadata.talks})}>
              Talk List
            </li>
            {metadata?.talks?.map(it => (
              <li key={it.id}
                  onClick={() => setState({kind: "talk", event: metadata.event, talk: it})}>
                {it.presenters?.join(", ") ?? "unknown"}: {it.title}
              </li>
            ))}
          </>
        )}
      </ul>
    </div>
  );
}
