import React, { useState, useEffect } from 'react';
import { RefreshCw, Copy, Mail, ArrowLeft } from 'lucide-react';

const TempMailGenerator = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [domain, setDomain] = useState('');
  const [messageData, setMessageData] = useState([]);
  const [messageShow, setMessageShow] = useState(false);
  const [messageFrom, setMessageFrom] = useState('');
  const [messageSubject, setMessageSubject] = useState('');
  const [messageTextBody, setMessageTextBody] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    generateNewEmail();
  }, []);

  const generateNewEmail = async () => {
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
    setMessageData([]);
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      if (username && domain) {
        await refreshMessage();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [username, domain]);

  async function refreshMessage() {
    const res2 = await fetch(
      `https://www.1secmail.com/api/v1/?action=getMessages&login=${username}&domain=${domain}`
    );
    const messages = await res2.json();
    setMessageData(messages);
  }

  function copyToClipboard(email) {
    navigator.clipboard.writeText(email).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  }

  async function whichMessageClicked(d) {
    try {
      const res = await fetch(
        `https://www.1secmail.com/api/v1/?action=readMessage&login=${username}&domain=${domain}&id=${d.id}`
      );
      const message = await res.json();
      setMessageFrom(message.from);
      setMessageSubject(message.subject);
      if (message.textBody.trim() === "") {
        setMessageTextBody(message.htmlBody);
      } else {
        setMessageTextBody(message.textBody);
      }
      setMessageShow(true);
    } catch (error) {
      console.log("Error reading message:", error);
    }
  }

  return (
    <div className="container">
      <div className="temp-mail-box">
        <h1 className="title">Temp-Mail Generator</h1>
        <div className="email-display">
          <p className="email">{email}</p>
          <div className="button-group">
            <button 
              onClick={() => copyToClipboard(email)} 
              className={`icon-button ${copySuccess ? 'success' : ''}`}
              title="Copy email"
            >
              <Copy size={20} />
              {copySuccess && <span className="tooltip">Copied!</span>}
            </button>
            <button 
              onClick={generateNewEmail} 
              className="icon-button"
              title="Generate new email"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>
        
        {!messageShow ? (
          <div className="inbox">
            <h2 className="subtitle">Inbox</h2>
            {messageData.length === 0 ? (
              <p className="no-messages">No messages yet. They will appear here.</p>
            ) : (
              <ul className="message-list">
                {messageData.map((message) => (
                  <li
                    key={message.id}
                    onClick={() => whichMessageClicked(message)}
                    className="message-item"
                  >
                    <div className="message-preview">
                      <Mail className="message-icon" size={20} />
                      <div>
                        <p className="message-subject">{message.subject}</p>
                        <p className="message-from">{message.from}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="message-view">
            <button
              onClick={() => setMessageShow(false)}
              className="back-button"
            >
              <ArrowLeft size={20} />
              Back to Inbox
            </button>
            <div className="message-content">
              <h2 className="message-title">{messageSubject}</h2>
              <p className="message-sender">From: {messageFrom}</p>
              <div
                className="message-body"
                dangerouslySetInnerHTML={{ __html: messageTextBody }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TempMailGenerator;