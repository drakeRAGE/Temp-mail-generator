import React, { useState, useEffect } from "react";
interface Message {
  id: number;
  from: string;
  subject: string;
  date: string;
  textBody?: string;
}

const Home: React.FC = () => {
  const [del, setDelete] = useState(false);
  const [email, setEmail] = useState("");
  const [messageData, setMessageData] = useState<Message[]>([]);
  const [username, setUsername] = useState("");
  const [domain, setDomain] = useState("");
  const [messageShow, setMessageShow] = useState(false);
  const [messageSubject, setMessageSubject] = useState("");
  const [messageFrom, setMessageFrom] = useState("");
  const [messageTextBody, setMessageTextBody] = useState("");

  useEffect(() => {
    async function getEmail() {
      const res = await fetch(
        "https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1"
      );
      const randomEmail = await res.json();
      setEmail(randomEmail[0]);
      const email = randomEmail[0];
      const atIndex = email.indexOf("@");
      const username = email.substring(0, atIndex);
      setUsername(username);
      const domain = email.substring(atIndex + 1);
      setDomain(domain);

      const interval = setInterval(async () => {
        const res2 = await fetch(
          `https://www.1secmail.com/api/v1/?action=getMessages&login=${username}&domain=${domain}`
        );
        const messages: Message[] = await res2.json();
        setMessageData(messages);
      }, 10000); // Update every 10 seconds

      return () => {
        clearInterval(interval);
      };
    }

    getEmail();
  }, [del]);

  async function refreshMessage() {
    const res2 = await fetch(
      `https://www.1secmail.com/api/v1/?action=getMessages&login=${username}&domain=${domain}`
    );
    const messages: Message[] = await res2.json();
    setMessageData(messages);
  }

  function copyToClipboard(email: string) {
    const input = document.createElement("input");
    input.value = email;
    document.body.appendChild(input);
    input.select();
    input.setSelectionRange(0, 99999);
    document.execCommand("copy");
    document.body.removeChild(input);
  }

  async function whichMessageClicked(d: Message) {
    try {
      const res = await fetch(
        `https://www.1secmail.com/api/v1/?action=readMessage&login=${username}&domain=${domain}&id=${d.id}`
      );
      const message = await res.json();
      setMessageFrom(message.from);
      setMessageTextBody(message.textBody);
      setMessageSubject(message.subject);
      setMessageShow(true);
    } catch (error) {
      console.log("Error reading message:", error);
    }
  }

  return (
    <div className="container">
      <div className="upper-container">
        <h1 className="title">Temp Mail Generator</h1>
        <input
          title="email-input"
          className="email-input"
          value={!email ? "loading.." : email}
          readOnly
        />
        <div className="button-container">
          <button
            className="button"
            onClick={() => {
              copyToClipboard(email);
            }}
          >
            Copy Email
          </button>
          <button className="button" onClick={() => window.location.reload()}>
            Change Mail
          </button>
          <button className="refresh-button" onClick={refreshMessage}>
            {/* <img
              src="/refresh.png"
              alt="Refresh Icon"
              className="refresh-icon"
            /> */}
            Refresh Mails
          </button>
        </div>
      </div>
      <div className="middle-container">
        <div className="loader">
          <img src="/loadinganimation.svg" alt="" width={40} height={40} />
        </div>
      </div>
      <div className="bottom-container">
        <div className="mailbox-title">
          <span>{!messageShow ? "Inbox" : "Message Box"}</span>
          <img src="/mail.png" width={30} height={30} alt="mailbox" />
        </div>
        {messageShow ? (
          <>
            <button
              className="go-back-button"
              onClick={() => setMessageShow(false)}
            >
              Go Back
            </button>
            <div className="message-box">
              <div className="message-header">
                <p>
                  <strong>From:</strong> {messageFrom}
                </p>
              </div>
              <div className="message-header">
                <p>
                  <strong>Subject:</strong> {messageSubject}
                </p>
              </div>
              <div className="message-body">
                <p>
                  <strong>Body:</strong> {messageTextBody}
                </p>
              </div>
            </div>
          </>
        ) : (
          messageData.map((d) => (
            <div
              key={d.id}
              className="mailbox-item"
              onClick={() => {
                whichMessageClicked(d);
              }}
            >
              <span>{d.from}</span>
              <p>{d.subject}</p>
              <div>
                <span>{d.textBody}</span>
                <p>{d.date}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Home;
