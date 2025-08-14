import { DataForm } from '@/components/formflow/DataForm';

export default function Home() {
  return (
    <main className="flex min-h-full items-center justify-center p-4 sm:p-8 md:p-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8 flex flex-col items-center justify-center gap-4">
          <div className="flex items-center gap-3">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 14" width="42" height="28"><path fill="#f93" d="M0 0h21v14H0z"/><path fill="#fff" d="M0 4.66h21v4.66H0z"/><path fill="#090" d="M0 9.33h21v4.66H0z"/><g transform="translate(10.5 7)"><circle r="2.33" fill="#00f"/><circle r="2" fill="#fff"/><path fill="#00f" d="M0-1.75a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5zM0-1.6a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2z"/><g id="d"><g id="c"><g id="b"><g id="a"><path fill="#00f" d="M0-1.6l.23.1a.15.15 0 0 0 0 .23l-.23.1V0h-.12l-.1-.23a.15.15 0 0 0-.23 0l-.1.23H-.6V-.23l-.23-.1a.15.15 0 0 0 0-.23l.23-.1V-1.6h.12l.1.23a.15.15 0 0 0 .23 0l.1-.23H0z"/></g><use href="#a" transform="rotate(15)"/></g><use href="#b" transform="rotate(30)"/></g><use href="#c" transform="rotate(60)"/></g><use href="#d" transform="rotate(120)"/><use href="#d" transform="rotate(240)"/></g></svg>
            <h1 className="text-5xl md:text-6xl font-headline font-bold text-foreground">
              NovaCard
            </h1>
          </div>
          <p className="text-muted-foreground mt-2">
            Please fill out the form below to submit your details.
          </p>
        </div>
        <DataForm />
      </div>
    </main>
  );
}
