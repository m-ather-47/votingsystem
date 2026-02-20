-- Seed data

insert into admins (username, password)
values ('admin', '$2b$10$Y/22PvRIrnM/jdpzMCHAXeAIJjkU8SXAQbVrKj58b1lbrnBsPBQIG')
on conflict (username) do nothing;

insert into voters (name, cnic, dob, photo, status)
values
  ('Ali Raza', '3520212345671', '2000-01-15', '/profile.jpg', 'Active'),
  ('Sara Khan', '3520276543219', '2001-05-22', '/profile.jpg', 'Active')
on conflict (cnic) do nothing;

with election as (
  insert into elections (name, status)
  values ('University Student Council Election 2026', 'Active')
  on conflict (name) do update set status = excluded.status
  returning id
),
positions as (
  insert into positions (election_id, name)
  select election.id, v.name
  from election
  cross join (values ('President'), ('Vice President')) as v(name)
  on conflict (election_id, name) do update set name = excluded.name
  returning id, name, election_id
)
insert into candidates (name, party, position, photo, position_id, election_id)
select v.name, v.party, v.position, v.photo, p.id, p.election_id
from (
  values
    ('Ali Raza', 'Unity Party', 'President', '/profile.jpg'),
    ('Sara Khan', 'Progressive Front', 'President', '/profile.jpg'),
    ('Bilal Ahmed', 'Unity Party', 'Vice President', '/profile.jpg'),
    ('Hira Noor', 'Progressive Front', 'Vice President', '/profile.jpg')
) as v(name, party, position, photo)
join positions p on p.name = v.position
left join candidates c
  on c.name = v.name
  and c.party = v.party
  and c.position = v.position
where c.id is null;
