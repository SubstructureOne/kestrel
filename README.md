# Substructure Kestrel

This repository contains the implementation of the Kestrel Platform for
hosting self-sufficient open-source SaaS applications.

The design philosophy for Kestrel is simple:

1. Developers should be able to spin up instances of their open source SaaS
   solutions without worrying about hosting costs.
2. Users should be able to use open source SaaS solutions by paying for
   the resources needed to run the service for their particular use case, plus
   some reasonable service fee which goes back to the developer.
3. For users who prefer the predictability of simple subscription models, free
   tiers, etc., enterprising providers should have the flexibility to build
   their own customized business models on top of Kestrel products.

To support this vision, Kestrel provides a few basic functionalities:

1. Provide a few basic services (storage, database, and query) with corresponding
   usage fees.
2. Register all incoming data & requests with a user, who is charged based on
   their usage.
3. Define a margin per application so that the application developer receives
   compensation for the value their application provides. For example, if the
   base price for storage is $0.03/GB/mo, and a given application has a margin
   of 30%, the user would be charged $0.039/GB/mo, with $0.009/GB/mo going to
   the developer (but see below).
4. Define compensation shares for dependent projects and contributors. For
   example, if Developer A provides a fully fledged application "AppA", and
   Developer B forks it as "AppB" and adds a small feature they think would be
   useful, a reasonable compensation share for Developer A based on AppB's usage
   might be 95%, since their AppA provided the vast majority of the value of
   AppB. Therefore, if AppB was receiving $.009/Gb/mo for user storage, only 
   $.00045/Gb/mo (5%) might actually go to Developer B while $.00855 (95%) would
   go to Developer A. From there, compensation shares would cascade - if
   Developer A was a two-person effort, each might receive 50% of those
   proceeds.

Note that the mechanism(s) for defining margins and compensation shares have 
not yet been defined.

## Implementation Notes

Kestrel is built in Typescript on top of Cloudflare Workers and Supabase.
Cloudflare Workers provide a convenient substructure - because Cloudflare does
not charge for bandwidth, only API calls and storage need to be tracked
by Kestrel to appropriately pass along costs. 

The Supabase Postgres interface provides a convenient and powerful basic
persistece layer. By utilizing JSONB columns in Postgres, Kestrel can provide
what is effectively a simple document database to individual applications.

Kestrel does not itself implement or provide any cryptographic functionality;
a naive Kestrel application will store all of its users' data fully publicly
visible. Modern web browsers however support powerful cryptographic primitives.
Kestrel Photos, the sample Kestrel application, protects users' data by
encrypting all images prior to upload on the browser side, and then decrypts
them on download.

The downside to this approach is that it requires users to manage their own
encryption keys. They can be stored locally in the browser using IndexedDb,
but as soon as you switch to another browser you need to reimport your key(s).