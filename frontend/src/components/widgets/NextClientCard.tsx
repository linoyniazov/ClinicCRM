type NextClientCardProps = {
  name: string;
  service: string;
  time: string;
};

export default function NextClientCard({ name, service, time }: NextClientCardProps) {
  return (
    <div>
      <h3>Next Client</h3>
      <p>
        <strong>{name}</strong>
      </p>
      <p>{service}</p>
      <p>{time}</p>
    </div>
  );
}
